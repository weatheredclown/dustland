from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:8080/dustland.html")

            # Wait for module picker
            page.wait_for_selector("#modulePicker")

            # Check ACK glyph
            ack_glyph = page.locator("#ackGlyph")
            expect(ack_glyph).to_be_visible()
            # Verify it is an anchor tag with correct href
            expect(ack_glyph).to_have_attribute("href", "adventure-kit.html")
            expect(ack_glyph).to_have_attribute("aria-label", "Adventure Construction Kit")

            # Check Multiplayer glyph
            mp_glyph = page.locator("#mpGlyph")
            expect(mp_glyph).to_be_visible()
            # Verify it is an anchor tag with correct href
            expect(mp_glyph).to_have_attribute("href", "multiplayer.html")
            expect(mp_glyph).to_have_attribute("aria-label", "Multiplayer")

            # Take screenshot
            page.screenshot(path="verification/module_picker.png")
            print("Verification successful!")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
