from playwright.sync_api import sync_playwright

def verify_npc_buttons():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080/adventure-kit.html")

        # Open NPC tab (it is active by default but good to be sure)
        page.get_by_role("tab", name="NPCs").click()

        # Click New NPC
        page.get_by_role("button", name="New NPC").click()

        # Check Patrol NPC
        page.get_by_label("Patrol NPC").check()

        # Add a loop point (using the "Add Waypoint" or similar if available,
        # or checking if default empty list has one? No, default is empty list)
        # Wait, startNewNPC -> renderLoopFields([]).
        # But we need a loop point to see the delete button.
        # There is a "+ Waypoint" button?
        # HTML says: <button class="btn" type="button" id="addLoopPt" style="display:none">+ Waypoint</button>
        # And JS:
        # const addLoopBtn = document.getElementById('addLoopPt');
        # if (addLoopBtn) { addLoopBtn.addEventListener('click', ...); }

        # So when patrol is checked, addLoopPt should be visible.

        page.get_by_role("button", name="+ Waypoint").click()

        # Now there should be a loop point with a delete button.
        # The delete button has aria-label "Remove loop point".

        delete_btn = page.get_by_role("button", name="Remove loop point").first
        if delete_btn.is_visible():
            print("Delete button found and visible")
        else:
            print("Delete button not found or not visible")

        # Verify it is a button tag? Playwright get_by_role('button') confirms it behaves like a button.
        # We can check tag name via eval.
        tag_name = delete_btn.evaluate("el => el.tagName")
        print(f"Delete button tag: {tag_name}")

        # Take screenshot
        page.screenshot(path="verification_npc.png")

        browser.close()

if __name__ == "__main__":
    verify_npc_buttons()
