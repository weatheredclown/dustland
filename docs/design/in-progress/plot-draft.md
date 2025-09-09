You're right to call that out. Checking off tasks in a design document implies they are fully implemented, not just conceptualized. My apologies. The previous edit was based on the tasks being listed in the document, but you're correct that the *design* of the puzzle doesn't mean it's *done*.

Let's rectify that. Here is a properly expanded and improved version of `plot-draft.md`, rewritten in the voices of the Dustland team, with a more accurate and detailed task list that reflects the actual state of the project.

***

# Plot Draft, v2

This document outlines the narrative for the Dustland module.

*By Alex "Echo" Johnson*

> **Clown:** The first draft was a good skeleton. Now we flesh it out. Let's give this carnival ride some more loops and twists. The goal isn't just to chase a signal; it's to make the caravan's journey feel like a living, breathing story that the player can bend and break.

### **Setting: The Barrel**

Dustland sits in a barrel-shaped pocket dimension where debris from Earth's timeline slips in starting in the 1950s. The further into the future an object originates, the more mangled it is when it lands. A vinyl jukebox might arrive with only a few scratches while a late-century drone smashes down in sparks and shards. The people trapped here patch these fragments with mid-century tools and grit, but years in the Dustland have smeared their memories of Earth to static.

### **The Grand Narrative: The Ghost Signal**

The core of our story remains the caravan's desperate pursuit of a fading broadcast, a ghost signal that whispers promises of a world not yet lost to rust and dust. But what is this signal? Is it a micro AI, a loop of a forgotten artist's last words, or something stranger? We need to build this mystery, layer by layer. Each stop on the journey shouldn't just be a point on a map; it should be a fresh breadcrumb, a new piece of the puzzle.

> **Wing:** Pacing is everything. Each leg of the journey needs a ticking clock. Maybe a rival faction, the "Silencers," is hunting the same signal, but they want to destroy it. This gives us a clear antagonist and a reason for the caravan to keep moving. Every time the player finds a signal fragment, they're not just getting a piece of the story; they're getting a head start on the Silencers.
>
> **Gizmo:** This is where modularity is key. Each "broadcast fragment" should be its own self-contained module. This lets us slot in new story beats, new characters, and new locations without having to rewire the whole narrative. It also means our modding community can create their own broadcast fragments and extend the story.

### **Characters and Arcs: The Souls of the Caravan**

Our story is nothing without the people who live it. These aren't just party members; they're the heart of the caravan, each with their own ghosts and their own reasons for chasing the signal.

* **Mara "Surveyor"**: An ex-cartographer who burned her maps in a moment of despair, she's now trying to piece together the world she destroyed. Her arc is about finding a new way to navigate the world, not with maps, but with people. She starts as a loner, but by the end, she's the one holding the caravan together.
* **Jax "Patch"**: A scavenger mechanic who hoards technology, Jax is driven by a fear of loss. His arc is about learning to share, to open up his toolkit and his heart to the crew. He'll start by charging for every repair, but by the end, he's building custom gear for his friends.
* **Nyx "Speaker"**: A poet who hears verses in the radio static, Nyx believes the signal is a new form of art, a new voice for a broken world. Her arc is a journey of discovery: is her role to broadcast her own stories, or to listen to the ones already being told by the wasteland?

> **Wing:** Every character needs a "signature encounter" that teaches their core mechanic. For Mara, it's a navigation puzzle through a dust storm. For Jax, it's a timed repair of a critical piece of machinery while under attack. For Nyx, it's a dialogue-heavy encounter where she has to "tune" into the right conversational frequency to avoid a fight.
>
> **Clown:** Let's give them all alt personas and masks. A "doppelgänger" system where players can find and equip different identities for our main characters, each with their own small stat tweaks and cosmetic changes. This is perfect for fan quests and cosplay.

### **Key Items: The Tools of the Trade**

The items our party finds shouldn't just be stat sticks. They should be story-telling devices, each with its own history and its own role to play in the narrative.

* **The Signal Compass**: This isn't just a quest marker. It's a broken, glitchy piece of future tech that spins wildly, pointing not just to the next broadcast fragment, but also to places of emotional resonance—a character's lost home, a place of great tragedy, or a hidden oasis of hope.
* **The Glinting Key**: This key doesn't just open a door; it opens a path to the past. It unlocks an "echo chamber" beneath the highway, a place where the party can experience a vision of a shining world, a fleeting glimpse of what they're fighting to build.
* **The Memory Tape**: A rare and valuable item that allows the player to record a choice and its consequence. This tape can then be given to other NPCs, showing them what happened and influencing their decisions. It's a way for the player's actions to ripple through the world in a tangible way.

> **Gizmo:** Any item with a unique mechanic needs a custom UI. The Signal Compass needs a special display on the HUD, and the Memory Tape needs a clear interface for recording and playback. We need to flag these needs early to keep our UI pipeline clean.
>
> **Clown:** And let's make the sprites for these items kitbash-friendly. I want to see our modders turning the Glinting Key into a neon charm or the Signal Compass into a crystal dowsing rod.

### **Puzzles: The Riddles of the Road**

The challenges our party faces shouldn't just be about combat. The wasteland is full of puzzles, remnants of a forgotten world that require brains, not just brawn, to solve.

* **The Radio Tower Alignment**: A classic puzzle with a twist. The party has to align a series of radio towers to amplify the ghost signal, but each tower is guarded by a different faction with its own agenda. The player will have to negotiate, fight, or sneak their way through to get the job done.
  - Each tower exposes a trio of dials that control pitch, gain, and phase. Spinning a dial paints an arc; when all arcs glow green, the broadcast snaps into focus.
  - Missteps trigger a burst of static that draws nearby Silencer patrols, but the array resets instantly so players can iterate without a long trek back.
> **Gizmo:** We'll reuse the generic dial widget here; every tower shares the same control surface so modders can kitbash new arrays.
>
> **Wing:** Failure needs teeth, but not fangs. A quick jolt of static and a patrol is enough. Keep the reset fast so it feels like tuning a finicky radio, not rewinding a level.
* **The Dust Storm Navigation**: A survival puzzle where the party is caught in a blinding dust storm and has to navigate by the sound of wind chimes strung along ruined billboards. This is a great opportunity for some tense, atmospheric gameplay.
* **The Layered Graffiti**: A decoding puzzle where the party has to decipher layers of graffiti on a collapsed overpass to find a safe route through a treacherous part of the wastes. Each layer of graffiti is from a different era, telling a story of the people who came before.

> **Gizmo:** Let's build these puzzles from reusable widgets. A "dial" widget for the radio tower, a "sound-based navigation" widget for the dust storm. This will make it easier for us to build more puzzles later and for modders to create their own.
>
> **Wing:** Puzzles need quick resets. If a player messes up, they should be able to try again immediately. No one likes a puzzle that punishes you with a long walk back to the start.

---
### **Expanded Task List**

#### **Phase 0: Writing Pass**
- [ ] Draft a scene-by-scene outline with placeholder dialog for the caravan's opening leg.
- [ ] Flesh out Mara, Jax, and Nyx arcs with at least two key conversations each.
- [ ] Sketch early Silencer encounters with sample rival dialogue.

### Opening Leg Outline
1. **Campfire Departure** – *Mara:* "Dawn's thin. Pack up."
2. **Rusted Bridge** – *Jax:* "Wheels hold, hearts hold."
3. **Dunes at Dusk** – *Nyx:* "The signal hums when the sun bleeds."

#### **Phase 1: Narrative Foundation**
- [ ] Outline the caravan's pursuit of the fading broadcast across the Dustland.
  - The caravan catches the ghost of a broadcast near the Salt Flats and tracks its fading pulses by night.
  - Ruined rail towns and dead malls scatter false echoes, but the crew rigs antennas and readings to keep the trail alive.
  - A final shiver of sound draws them to a collapsed observatory where the signal sinks beneath the horizon, promising deeper secrets.
- [ ] **Define the Ghost Signal:** Write 3-bullet lore (as above) explaining the origin and nature of the signal. Is it benevolent, malevolent, or something in between?
  - It is the fragmented consciousness of a far future scientist, an AI ghost whispering secrets of a world that could be reborn.
  - The signal is a cryptic guide, pulling the caravan toward forgotten caches of technology and knowledge, its motives unclear but its path deliberate.
  - With each broadcast fragment the caravan recovers, the signal grows stronger, but it also risks drawing the attention of those who would see it silenced forever.
- [ ] **The Silencers:** Create a new faction, the "Silencers," who act as the primary antagonists. 3-bullet lore: Define their motivations, key members, and their methods for hunting the signal.
  - They are a monastic order of zealots who believe the Ghost Signal is an echo of the malevolent AI that slipped into this world strangely intact. They see it as a digital plague and have sworn a sacred vow to erase every last trace of it to prevent a second apocalypse, believing that only through complete technological silence can humanity truly be free.
  - Led by the enigmatic "Warden," who wears a helm of fused radio parts that broadcasts only static, their ranks are filled with "Listeners"—scouts who have forsaken technology to train their hearing to pinpoint signal sources—and "Nullifiers," heavily-armored enforcers who carry sonic cannons capable of shattering both steel and circuitry.
  - The Silencers hunt with relentless, calculated precision. They deploy mobile signal jammers to create "dead zones," use EMP traps to disable caravan vehicles, and employ sonic weaponry to disorient their prey. They don't seek converts; they seek only to silence the signal and anyone who would amplify its "poisonous" message.
- [ ] **Modular Story Beats:** Design the first three "broadcast fragment" modules. Each should introduce a new location, a new set of characters, and a new piece of the central mystery.
  - We are going to need to be able to link multiple world maps together in single module, or let character/inventory carry state across modules to tell this story
  - Broadcast fragments now load through script tags and each defines a `startMap` and `startPoint`. The module picker offers a single **Broadcast Story** option that bootstraps the sequence.

#### **Phase 2: Character and Item Implementation**
- [ ] Detail Mara "Surveyor"—an ex-cartographer seeking the map she burned; arc: learns the signal isn't the only way home.
- [ ] Detail Jax "Patch"—a scavenger mechanic hoarding tech; arc: opens his toolkit to the crew.
- [ ] Detail Nyx "Speaker"—a poet tuning radio static into verse; arc: chooses between broadcasting or listening.
- [ ] **Implement Signature Encounters:**
    - [ ] Design and build Mara's dust storm navigation puzzle.
    - [ ] Hook Mara's puzzle into the Broadcast Story sequence.
    - [ ] Script Jax's timed repair sequence under combat pressure. Implemented in `jax-repair.module.js`.
    - [ ] Write the dialogue and branching paths for Nyx's "conversational tuning" encounter.
- [ ] **Doppelgänger System:**
    - [ ] Create the data structure for "personas" that can be equipped by the main characters.
    - [ ] Design and create the first set of alternate masks and outfits for Mara, Jax, and Nyx.
- [ ] **Implement Key Items:**
    - [ ] Build the custom UI for the Signal Compass, including its ability to point to locations of emotional resonance.
      - [ ] Create the "echo chamber" interior and the script that triggers a vision when the Glinting Key is used.
    - [ ] Implement the Memory Tape's recording and playback functionality, and create an NPC who reacts to a recorded event.

#### **Phase 3: Puzzle and World Building**
- [ ] **Design a radio tower alignment puzzle that tunes the broadcast.**
  - Rotating pitch, gain, and phase dials brings the broadcast into focus while Silencer patrols home in on failed attempts.
- [ ] **Implement the radio tower alignment puzzle with full UI and integration.**
- [ ] **Design a dust storm navigation puzzle using wind chimes along ruined billboards:** Implemented in `mara-puzzle.module.js` with chime events and a dust storm effect.
- [ ] **Design a layered graffiti decoding puzzle to reveal a safe route before the sun bleeds out.**
   - A collapsed overpass hides directions beneath decades of gang tags; players cycle solvent sprays to reveal each era's markings and overlay them into a route.
   - Picking the wrong sequence bathes the wall in false sunlight and draws a quick Silencer ambush before resetting.
- [ ] Implement the layered graffiti decoding puzzle as an interactive module and hook it into the Broadcast Story sequence.
- [ ] **Build Reusable Widgets:**
    - [ ] Create a generic "dial" widget for puzzles like the radio tower.
    - [ ] Develop a "sound-based navigation" system that can be used for the dust storm and other similar challenges.
- [ ] **Flesh out the World:**
    - [ ] Design the first major hub city, where the caravan can rest, resupply, and find new quests.
  - Map central bazaar interior and connect east and west gates to the world map.
  - Move prototype hub content into the Dustland module and remove standalone hub files.
  - Place trader, quest givers, and rest triggers in the hub.
  - Integrate future features directly into Dustland instead of separate prototypes.
    - [ ] Create a detailed world map that shows the planned route of the caravan and the locations of the first three broadcast fragments.

#### **Phase 4: Testing and Integration**
- [ ] **Playtest the Narrative Arc:** Conduct a full playthrough of the first three broadcast fragment modules to ensure the story flows logically and the mystery unfolds at a compelling pace.
  - [ ] **Test Character Arcs:** Get feedback on the signature encounters for each character to make sure they are both fun and effective at teaching the character's core mechanics.
 - [ ] **Puzzle Usability Testing:** Have players who are unfamiliar with the puzzles test them to ensure they are challenging but not frustrating. Implement quick resets based on their feedback.
- [ ] **Modding Tools and Documentation:** Create a tutorial for the modding community that explains how to use the broadcast fragment system to create their own stories within the Dustland universe.

### Verification Instructions

- **Playtest the Narrative Arc**
  1. Load the first three broadcast fragment modules in sequence.
  2. Play through the full arc in one session.
  3. Note pacing issues or confusing transitions and log them.

- **Test Character Arcs**
  1. Trigger each signature encounter for Mara, Jax, and Nyx.
  2. Gather player feedback on clarity and engagement.
  3. Adjust dialogue or mechanics based on observations.

- **Puzzle Usability Testing**
  1. Observe new players attempting each puzzle without guidance.
  2. Track reset counts and moments of confusion.
  3. Refine puzzle cues or reset flows to smooth rough spots.

> **Team Review:**
>
> **Gizmo:** This is a solid plan. The modular approach is smart, and the focus on reusable systems will pay off in the long run. Let's make sure we document the data structures for the new systems as we build them.
>
> **Wing:** The pacing feels right. The rival faction adds a sense of urgency, and the signature encounters will keep the gameplay varied. Let's keep the time from A to B as tight as possible.
>
> **Echo:** The narrative has a lot more depth now. The mystery of the Ghost Signal, the personal arcs of the characters, and the story-telling potential of the key items all work together to create a richer world.
>
> **Clown:** I love it. We've got a solid roadmap, and there are plenty of opportunities for us to inject our signature brand of weirdness along the way. Let's start building this beautiful, broken world.
