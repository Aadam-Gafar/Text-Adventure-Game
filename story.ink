// STORY VARIABLES - These update throughout the story
VAR first_visit = true
VAR has_key = false
VAR power_restored = false

// CHECKPOINT VARIABLES - These store the story variables at specific points
VAR cp_first_visit = true
VAR cp_has_key = false
VAR cp_power_restored = false

// ===================================
// STORY START
// ===================================

-> introduction

// FUNCTIONS
=== function save_checkpoint() ===
~ cp_first_visit = first_visit
~ cp_has_key = has_key
~ cp_power_restored = power_restored

=== function load_checkpoint() ===
~ first_visit = cp_first_visit
~ has_key = cp_has_key
~ power_restored = cp_power_restored

// === CHECKPOINT DISPLAY ===
=== show_cp_saved ===
═══ CHECKPOINT ═══
->->

// === KNOTS - Major story sections ===

=== introduction ===
# MUSIC: skyrim_music
In the bitter cold of skyrim, you find a ruined Dwemer facility.

* [Enter the facility] 
    -> enter_facility

// === MAIN FACILITY KNOT ===
=== enter_facility ===
{not power_restored:
    # MUSIC: ruin_music
- else:
    # MUSIC: dwemer_music
}

{first_visit:
    The doors swing inward like thunder. Before you is a reception of sorts, preceding a stony labyrinth of impossible construnction, hewn from stone and submerged into darkness. Great brass pipes run along the walls. 
    ~ first_visit = false
- else:
    You return to the reception area.
}

Ahead, the corridor branches: leftward toward a flickering blue light, rightward into darkness whence comes the grinding of ancient gears.

+ [Venture toward the blue light] -> laboratory
+ [Follow the sound of machinery] -> machine_room

// === LABORATORY ===
=== laboratory ===
You enter a room where blue lanterns illuminate the room. They light up worktables of golden alloy that holds apparatus whose purpose you can only guess. Crystalline vessels, coiled tubes, and mechanism of delicate construction. Among the machinery is a button with a keyhole{power_restored:, already turned from when you last used it}.

+ {has_key && !power_restored} [Activate the button] -> power_restored_sequence
+ {not has_key} [Inspect the button] -> examine_button
+ [Leave this chamber] -> enter_facility

= examine_button
The button looks like it needs a key to work.
+ [Leave this chamber] -> enter_facility

= power_restored_sequence
You put the key into the button's keyhole and turn it. Light blooms throughout the facility. The pipes along the walls begin to hum. Somewhere in the depths, something massive awakens.

~ power_restored = true
~ save_checkpoint()
-> show_cp_saved ->

+ [This may have been a mistake...] -> enter_facility

// === MACHINE ROOM ===
=== machine_room ===

{not power_restored:
    In the dimness, you discern vast mechanical shapes. One of them looks vaguely humanoid but it's far too tall to be a man. All lies still and silent, waiting. It's too dark to continue. {!has_key: However, you can just barely make out a key on the floor.}
    
    + {!has_key} [Pick up the key] 
        ~ has_key = true
        You pick up the key. -> enter_facility
    + {!has_key} [Leave the key] -> enter_facility
    + [Leave this chamber] -> enter_facility
    
- else:
    The chamber blazes with light now, revealing great wheels of bronze that turn in precise alignment. In the chamber's heart stands a Dwemer Centurion, a construct of brass and dwemer-metal standing thrice the height of a man. He looks like he's trying to speak.
    
    ~ save_checkpoint()
    -> show_cp_saved ->

    + [Listen to what he has to say] -> hello_world
}

= hello_world
"Hello, world!" he says.

<b>═══ THE END ═══</b>
-> END