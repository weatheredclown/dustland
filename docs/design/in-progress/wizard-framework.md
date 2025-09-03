# Creator Wizards: A Guided Workflow

*By Priya "Gizmo" Sharma*

> **Wing:** Our tools are sharp, but some tasks are still a marathon. Linking interiors, setting up quest flags, wiring up NPC dialogue—it's a lot of manual cross-referencing. If we want the community to build worlds alongside us, we need to pave the cowpaths.
>
> **Gizmo:** Exactly. A wizard isn't about dumbing down the tools. It's about guiding the creator. It asks the right questions in the right order, validates input, and handles the boilerplate. You focus on the *what*, the wizard handles the *how*. It’s an assembly line for our most common, complex creations.

### Core Principle: The Guided Path

A wizard is a sequence of UI panels, each with a single, clear task. Name the NPC. Choose a portrait. Write the dialogue. Select the item to fetch. The wizard chains these simple steps into a complex result. No more hunting through menus or forgetting to link a quest trigger.

> **Clown:** This has to feel like a conversation, not a tax form. Lots of previews. When I pick a portrait, show it to me. When I place a building, let me see it on the map. Instant feedback is key. If a creator has to finish the whole wizard to see the result, we've failed.
>
> **Echo:** And let's give them an "eject" button. If a creator gets halfway through and wants to switch to the advanced, manual tools, they should be able to. The wizard generates the basic object, and they can then hand-tune it. It’s a starter, not a straitjacket.

### The Wizard Component

The foundation is a generic `Wizard` component. It takes a configuration object that defines the steps. Each step is a small bundle of UI and logic.

```javascript
// A new wizard is just a configuration object.
// The framework provides the UI and state management.
const NpcWizard = {
  title: "NPC & Quest Wizard",
  steps: [
    { id: 'name', title: 'Name & Portrait', component: 'NameAndPortraitStep' },
    { id: 'dialogue', title: 'Dialogue', component: 'DialogueStep' },
    { id: 'quest', title: 'Fetch Quest', component: 'FetchQuestStep' },
    { id: 'placement', title: 'Placement', component: 'PlacementStep' }
  ]
};
```

The framework handles:
-   Rendering the step-by-step navigation.
-   Managing the state of the object being created as it's built up over multiple steps.
-   Providing "Next" and "Back" buttons.
-   Validating required fields before proceeding.

> **Gizmo:** This structure means a new wizard is just a new configuration and a set of step components. We can build a library of reusable steps (`ItemPicker`, `LocationPicker`, `TextEditor`) so that new wizards are mostly assembly, not new code. All data lives in JS/JSON objects, no server required.

### Example Wizard 1: NPC with Fetch Quest

This wizard walks a creator through making an NPC who asks the player to find an item.

1.  **Step 1: Name & Portrait:** Simple text input for the NPC's name. A gallery view to select a portrait from `/assets/portraits`.
2.  **Step 2: Dialogue:** A text area for the NPC's main dialogue. Include a simple variable format, like `Bring me the %ITEM_NAME%!`.
3.  **Step 3: Fetch Quest:**
    *   **Item:** An `ItemPicker` step that lets the creator choose an existing item from the game's item list.
    *   **Reward:** Another `ItemPicker` or a numerical input for the scrap reward.
    *   **Quest Flags:** The wizard automatically generates the necessary quest flags (`quest_start_npcName`, `quest_complete_npcName`) behind the scenes.
4.  **Step 4: Placement:** A map view where the creator can click to place the NPC.

> **Wing:** The magic here is the automation. The creator doesn't need to know how quest flags work. They just pick the item and the reward. The wizard writes the dialogue triggers, adds the item to the player's inventory on completion, and wires everything up.

### Example Wizard 2: Building with Linked Interiors

This wizard helps create a building with multiple interior rooms, like a house with a living room and a basement.

1.  **Step 1: Main Entrance:**
    *   **Exterior:** Choose a building sprite from the asset library.
    *   **Placement:** Place the building on the world map.
2.  **Step 2: First Interior:**
    *   **Interior Map:** Select a tilemap for the first room (e.g., `interior_living_room.tmx`).
    *   **Door Placement:** The wizard shows the interior map and asks the creator to place the "exit" door back to the world map.
3.  **Step 3: Add More Interiors (Optional & Repeatable):**
    *   **Interior Map:** Select a tilemap for the next room (e.g., `interior_basement.tmx`).
    *   **Connecting Doors:** The wizard shows both interior maps side-by-side and asks the creator to place the connecting doors in each room.

> **Gizmo:** The key is the visualization. Showing the two maps next to each other and having the creator draw the link makes the connection tangible. The wizard then generates the door objects with the correct `target_map` and `target_coords` properties. No more manual coordinate entry.

---
### **Expanded Task List**

#### **Phase 1: Core Wizard Framework**
- [x] **`Wizard` Component:** Create a generic, framework-free DOM component that takes a wizard configuration and manages the UI shell (title, step navigation, Next/Back buttons).
- [x] **State Management:** Implement a simple state store for the wizard to hold the data for the object being created.
- [x] **Step Component Library:** Build a small set of reusable step components:
    - [x] `TextInputStep`: A simple text input field.
    - [x] `AssetPickerStep`: A component to select an image/sprite from a directory.
    - [x] `MapPlacementStep`: A component to select coordinates on a game map.

#### **Phase 2: NPC & Quest Wizard**
  - [x] **Configuration:** Create the `NpcWizard` configuration object.
  - [x] **Custom Steps:** Develop the specific step components needed for this wizard:
    - `DialogueEditorStep`: A text area for writing dialogue.
    - `ItemPickerStep`: A component to select an item from the presets defined in `presets.js`.
  - [x] **Logic:** Write the final "commit" function for the wizard that takes the completed data and generates the new NPC and quest data objects, saving them to the appropriate module file.

#### **Phase 3: Building & Interiors Wizard**
 - [x] **Configuration:** Create the `BuildingWizard` configuration object.
 - - [x] **Custom Steps:**
      - [x] `TilemapPickerStep`: A component to select a tilemap file.
      - [x] `DoorLinkerStep`: The side-by-side view for connecting two interiors.
 - [x] **Logic:** Write the "commit" function that generates the building and door objects with the correct linkages.

#### **Phase 4: Integration & Testing**
- [x] **Editor Integration:** Add a "Wizards" menu to the main editor UI that lists the available wizards.
- [x] **Playtest: Create an NPC:** Have a team member use the NPC wizard to create a complete quest NPC. Time how long it takes.
- [x] **Playtest: Create a Building:** Have a team member use the Building wizard to create a multi-room building. Check for broken door links.
    1. Open the editor's **Wizards** tab.
    2. Click **Building Wizard**.
    3. Select two interior maps, using **Next** to move between steps.
    4. Click tiles in each pane to place the world entry/exit and the doors between rooms.
    5. Press **Done** and verify the module data links all doors correctly.

### Verification Instructions

- **Playtest: Create an NPC**
  1. Open the editor and run the NPC wizard.
  2. Build a quest NPC from start to finish.
  3. Note the time to completion and ensure the generated data loads in game.

- **Playtest: Create a Building**
  1. Use the Building wizard to assemble a multi-room structure.
  2. Enter and exit each room to confirm door links work.
  3. Record any broken links or placement issues.
