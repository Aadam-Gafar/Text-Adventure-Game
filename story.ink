// STORY VARIABLES - These update throughout the story
VAR first_visit = true
VAR power_restored = false

VAR inv_key = false
VAR inv_vessel = false
VAR inv_tube = false
VAR inv_Resonating_Aetheric_Harmonization_Calibration_Spanner_of_the_Seventh_High_Artisan = false

// ===================================
// STORY START
// ===================================

* [Start] -> introduction // Gets player to interact so webpage can load files to play music

// === CHECKPOINT DISPLAY ===
=== set_checkpoint ===
═══ CHECKPOINT ═══
# CHECKPOINT
->->

// === KNOTS - Major story sections ===
=== introduction ===
# MUSIC: skyrim_music

The wind comes off the Sea of Ghosts and it is a wind that cuts. It carries the salt and the ice and the memory of the Great Collapse. You walk through the drifts, and the snow is dry and fine, and it hisses against your boots like a dying fire.

Then, the mountain breaks. Out of the living rock of the jagged heights, the brass appears.

It is a ruin of the Deep Folk. The stone is worked with a precision that makes the modern world seem small and clumsy. The Dwemer are gone - gone into the earth or into the void - and they have left behind only these shells of bronze and steam. The great doors are tilted now, bitten by the frost of a thousand winters, yet they do not rust. They stand as a testament to a race that defied the gods and lost, leaving their bones to turn to dust in the dark.

The air near the entrance smells of ozone and ancient oil. It is a heavy smell, thicker than the mountain air. There is a sound, too - a low, mechanical thrumming that vibrates in the marrow of your teeth. The gears turn in the deep places, indifferent to the passage of men or the falling of empires. 

You stand before the threshold. The frost clings to your cloak, and your breath is a white ghost in the air. The ruin is vast, and it is silent, and it holds the secrets of a people who saw the world as a machine to be broken and rebuilt. You check the edge of your blade. The steel is cold. You step inside, leaving the wind behind, and the shadows of the Deep Folk receive you.

* [Enter the facility] 
    -> enter_facility

// === MAIN FACILITY KNOT ===
=== enter_facility ===
{first_visit:
    # MUSIC: ruin_music
    ~ first_visit = false
    The doors yielded. They swung inward with a sound like thunder rolling in a deep canyon, heavy and final. The echoes went away into the dark and did not return. You stood on the threshold, and the air that came out of the throat of the mountain was dry and smelled of hot metal and the dust of ages.

Before you lay a great hall. It was a place of reception for a people who had no guests, hewn from the roots of the world with a geometry that was right and terrible. The pillars were squared and massive. They bore the weight of the sky. Beyond the hall, the labyrinth began - a stony maze of impossible construction where the angles did not suit the eyes of men.

Great pipes of brass ran along the walls like the veins of a titan. They were warm to the touch. Inside them, the steam hissed, and the water moved, and the heart of the facility beat on in the gloom. The darkness was absolute. It was a thick, heavy darkness that swallowed the light of the frost outside. 

You looked into the deep. There was no wind here, only the steady, mechanical pulse of the earth. The stone was smooth and the floor was level, and you began to walk. 
- else:
    You turned back. The labyrinth was a place of silence and wrong angles, and you left it to the dark. You walked until the stone opened up and you were in the reception hall once more.
}

The path split before you. It was a choice between two silences, and neither was kind.

To the left, the stone was bathed in a pale, flickering glow. It was a blue light, cold and ethereal, like the shimmer of moonlight upon a frozen lake. It pulsed with a rhythmic uncertainty, casting long, distorted shadows that danced against the geometric precision of the walls. There was a hum there - a high, thin vibration that spoke of soul gems and the trapped lightning of the Deep Folk.

To the right, the corridor was swallowed by a darkness that no light could pierce. From that black throat came a sound that was old and relentless. It was the grinding of gears, metal screaming against metal in the slow, heavy labor of an engine that had forgotten its purpose but refused to die. The floor beneath your boots trembled with the force of it. It was a sound of teeth and gravity, a mechanical hunger that existed before you were born and would persist long after you were ghost.

+ [Venture toward the blue light] 
    -> laboratory
+ [Follow the sound of machinery] 
    -> machine_room

// === LABORATORY ===
=== laboratory ===
The blue light was stronger here. It spilled from lanterns of strange craft, casting a cold, sorcerous hue across a chamber dedicated to the labors of a lost intellect. The air was thick with the smell of static and old grease. 

Before you stood worktables forged of a golden alloy that did not tarnish. They were crowded with the wreckage of a high science. It was a workshop of the Deep Folk, and though the masters were gone, the tools remained, sharp and expectant in the azure gloom.

In the center of this mechanical grove sat a pedestal, and upon it, a button. Beside the button was a keyhole.

{power_restored:
    The key within the lock was already turned. The blue lanterns burned with a steady, regained purpose. The button sat waiting, live and dangerous.
}

- (opts)
// --- PICK UP OPTIONS ---
+ {not inv_key && not power_restored} [Pick up the ornate key]
    ~ inv_key = true
    You pocket the heavy, brass key.
    -> opts
+ {not inv_vessel} [Pick up vessel]
    ~ inv_vessel = true
    You take the crystalline vessel. 
    -> opts
+ {not inv_tube} [Pick up tube]
    ~ inv_tube = true
    You take the coiled copper tube.
    -> opts
+ {not inv_Resonating_Aetheric_Harmonization_Calibration_Spanner_of_the_Seventh_High_Artisan} [Pick up the Resonating Aetheric Harmonization Calibration Spanner of the Seventh High-Artisan]
    ~ inv_Resonating_Aetheric_Harmonization_Calibration_Spanner_of_the_Seventh_High_Artisan = true
    It is an absurdly long name for a tool that looks like a very shiny wrench. You take it.
    -> opts

// --- PUT DOWN OPTIONS ---
+ {inv_key && not power_restored} [Put down the key]
    ~ inv_key = false
    You set the key back on the golden table.
    -> opts
+ {inv_vessel} [Put down vessel]
    ~ inv_vessel = false
    You return the vessel to its place.
    -> opts
+ {inv_tube} [Put down tube]
    ~ inv_tube = false
    You set the tube back down.
    -> opts
+ {inv_Resonating_Aetheric_Harmonization_Calibration_Spanner_of_the_Seventh_High_Artisan} [Put down the Resonating Aetheric-Harmonization Calibration Spanner of the Seventh High-Artisan]
    ~ inv_Resonating_Aetheric_Harmonization_Calibration_Spanner_of_the_Seventh_High_Artisan = false
    You set the massive tool back on the workbench. The table groans slightly under its weight.
    -> opts

// --- ACTION & LEAVE ---
+ {inv_key && !power_restored} [Activate the button with the key] 
    -> power_restored_sequence
+ {not inv_key} [Inspect the button] 
    The button is cold. It requires a key to prime the mechanism.
    -> opts
+ [Leave this chamber] 
    -> enter_facility

= examine_button
The button sat silent in its housing, a cold eye of metal. Beside it, the keyhole was a dark and narrow void, empty of the brass teeth required to wake it. It was a lock of the Deep Folk, and it would not be fooled by the crude picks of men or the simple strength of a blade.
+ [Leave this chamber] 
    -> enter_facility

= power_restored_sequence
# MUSIC: dwemer_music
~ power_restored = true
~ inv_key = false

You took the key and fitted it into the lock. It was a heavy piece of brass, cold and etched with the sharp lines of the Deep Folk, and it slid home with a click that was small but absolute. You turned it and watched as In an instant the device clamped around the key and swallowed it whole.

There was a moment of profound silence, the indrawn breath of the earth. Then, the light came.

It did not flicker; it bloomed. From the blue lanterns in the workshop to the recessed sconces in the far corridors, a hard, white radiance surged through the glass, driving the shadows back into the stone. The golden alloy of the worktables caught the glare, shining with a sudden, fierce luster that hurt the eyes.

Along the walls, the pipes began to hum. It was a low, resonant sound that climbed in pitch until the very air seemed to vibrate. The steam hissed with a new, frantic energy, and the oil within the conduits began to flow, thrumming like the blood of a rising giant. 

Then came the sound from below. It was not a hum or a hiss, but a deep, tectonic groan that rose from the foundations of the world. Somewhere in the lightless depths, something massive and ancient had awakened. You felt it in the soles of your boots - the slow, grinding rotation of great wheels and the rhythmic strike of pistons the size of towers. The facility was no longer a tomb. It was a living thing, and it was hungry for the work it had been denied for an age.

+ [This may have been a mistake...] 
    -> enter_facility

// === MACHINE ROOM ===
=== machine_room ===
{not power_restored:
    The darkness here is a heavy thing, a thick shroud that clings to the skin. You stand at the edge of a great chamber where the light of the corridor dies, and in the gloom, you discern shapes that are vast and terrible.

They are the metal children of the Deep Folk. One among them looms larger than the rest, a hulking form of brass and iron that bears the likeness of a man, yet it stands far too tall for any mortal frame. Its limbs are thick as tree trunks, and its face is a mask of cold, unblinking bronze. It does not breathe. It does not move. It sits in a state of frozen violence, waiting for a command that was lost to the wind three thousand years ago.

The air is cold and the silence is absolute, save for the thrumming of the pipes behind you. To step further into the black is to walk into the mouth of a mountain that has forgotten the sun. It is too dark to continue.

    + [Leave this chamber] -> enter_facility
    
- else:
    -> set_checkpoint ->
    The chamber was a tomb no longer. The light was a white fire that filled every corner, chasing the shadows from the high, vaulted ceiling and reflecting off the great wheels of bronze. They turned now, heavy and slow, their teeth interlocking with a precision that was beautiful and cold. There was no friction, only the rhythmic, driving force of the mountain’s heart.

In the center of this turning world stood the Centurion.

It was a titan of brass and dwemer-metal, standing thrice the height of a man. Its chest was a broad furnace of gold-hued plate, and its arms were thick as the pillars of a temple. Now that the steam flowed, the construct trembled. A low, tonal vibration rose from its throat - a sound of rushing air and vibrating metal.

It did not strike. Instead, it tilted its massive, bearded head of bronze. Plumes of white vapor hissed from the joints of its neck, rhythmic and measured, like the breath of a man in the winter air. Its jaw moved with a heavy, mechanical clicking. It was a voice of brass, trying to find a language it had not spoken since the sun was young. It was trying to speak, and the sound was a lonely, grinding music that filled the hall, a ghost of a word caught in a throat of iron.

    + [Listen to what he has to say] -> hello_world
}

= hello_world
The sound came not from lungs, but from the very core of the machine. It was a voice of grinding plates and escaping steam, a tectonic rattle that shook the dust from the high rafters.

"Hello, world!" he said.
-> END