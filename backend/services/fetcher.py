import httpx
import trafilatura
from bs4 import BeautifulSoup
from urllib.parse import urlparse

TIMEOUT = 12        # direct fetch timeout (seconds)
JINA_TIMEOUT = 10   # Jina proxy timeout (fail fast, don't wait forever)
TEXT_CAP = 4000     # chars per source sent to LLM (keeps LLM fast)

# Jina Reader API - free, no key required, bypasses blocks and returns clean markdown
JINA_URL = "https://r.jina.ai/{url}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


async def fetch_and_clean(url: str) -> dict:
    """
    Fetch a URL using a 3-layer strategy:
    1. Jina Reader API (free proxy, bypasses 403s, returns clean text)
    2. Direct httpx fetch + trafilatura
    3. Direct httpx fetch + BeautifulSoup fallback
    """
    # --- Strategy 1: Jina Reader (most reliable) ---
    text, title = await _fetch_via_jina(url)
    if text:
        return {"url": url, "title": title, "text": text[:8000], "error": None}

    # --- Strategy 2 & 3: Direct fetch ---
    html, fetch_error = await _fetch_html_direct(url)
    if not html:
        return {"url": url, "title": None, "text": None, "error": fetch_error or "Could not fetch page content."}

    title = title or _extract_title(html)

    # trafilatura
    extracted = trafilatura.extract(html, include_comments=False, include_tables=True,
                                    no_fallback=False, favor_recall=True)
    if not extracted:
        extracted = _bs4_extract(html)

    if not extracted:
        return {"url": url, "title": title, "text": None,
                "error": "Page loaded but no readable text could be extracted (may be JavaScript-rendered or paywalled)."}

    text = _clean_whitespace(extracted)
    return {"url": url, "title": title, "text": text[:8000], "error": None}


async def _fetch_via_jina(url: str) -> tuple[str | None, str | None]:
    """
    Use Jina Reader API to fetch clean markdown text from any URL.
    Jina handles Wikipedia, paywalled sites, JS pages, etc.
    Returns (text, title) or (None, None) on failure.
    """
    try:
        jina_endpoint = JINA_URL.format(url=url)
        async with httpx.AsyncClient(
            timeout=JINA_TIMEOUT,
            follow_redirects=True,
            headers={"Accept": "text/plain", "X-Return-Format": "text"},
        ) as client:
            resp = await client.get(jina_endpoint)
            if resp.status_code == 200:
                content = resp.text.strip()
                if len(content) > 100:  # sanity check — not an empty/error response
                    # Jina prepends metadata lines like "Title: ..." — extract them
                    title = None
                    lines = content.splitlines()
                    text_lines = []
                    for line in lines:
                        if line.startswith("Title:") and not title:
                            title = line.replace("Title:", "").strip()
                        else:
                            text_lines.append(line)
                    text = _clean_whitespace("\n".join(text_lines))
                    return text[:TEXT_CAP], title
    except Exception:
        pass
    return None, None


async def _fetch_html_direct(url: str) -> tuple[str | None, str | None]:
    """Direct HTTP fetch, returning (html, error)."""
    try:
        async with httpx.AsyncClient(
            headers=HEADERS,
            timeout=TIMEOUT,
            follow_redirects=True,
        ) as client:
            resp = await client.get(url)
            if resp.status_code in (403, 401):
                return None, f"HTTP {resp.status_code}: This site blocks direct access. Try a different URL."
            resp.raise_for_status()
            return resp.text, None
    except httpx.HTTPStatusError as e:
        return None, f"HTTP {e.response.status_code}: Could not load this page."
    except httpx.TimeoutException:
        return None, "Request timed out — the page took too long to respond."
    except Exception as e:
        return None, f"Network error: {e}"


def _extract_title(html: str) -> str | None:
    try:
        soup = BeautifulSoup(html, "html.parser")
        og = soup.find("meta", property="og:title")
        if og and og.get("content"):
            return str(og["content"]).strip()
        tag = soup.find("title")
        return tag.get_text(strip=True) if tag else None
    except Exception:
        return None


def _bs4_extract(html: str) -> str | None:
    try:
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header",
                          "aside", "noscript", "iframe", "form"]):
            tag.decompose()
        main = soup.find("article") or soup.find("main") or soup.find("body")
        if main:
            return main.get_text(separator="\n")
        return soup.get_text(separator="\n")
    except Exception:
        return None


def _clean_whitespace(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    return "\n".join(lines)
