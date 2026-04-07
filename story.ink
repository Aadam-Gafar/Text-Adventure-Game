// ===================================
// DWEMER FACILITY DEMO
// Showcasing Ink's Features
// ===================================

// VARIABLES - Store state that persists throughout the story
VAR player_name = "Wanderer"
VAR has_key = false
VAR power_restored = false
VAR knowledge_level = 0
VAR times_visited_library = 0
VAR centurion_hostile = true
VAR health = 100

// CONSTANTS - Values that never change
CONST MAX_KNOWLEDGE = 3

// LIST - Define a set of related values (great for inventory, states, etc.)
LIST inventory = (nothing), dwemer_cog, soul_gem, ancient_scroll, attunement_crystal
LIST puzzle_solution = lever_one, lever_two, lever_three, lever_four

// ===================================
// STORY START
// ===================================

-> introduction

// === KNOTS - Major story sections ===
// Knots are the main structural units in Ink (like chapters)

=== introduction ===
~ player_name = "Delver" // ~ means execute code (change variables, etc.)

In the bitter cold of Skyrim's northern reaches, beyond the frozen wastes where even the frost trolls dare not tread, you stand before an entrance carved into living stone. The architecture speaks of an age long past, when the Dwemer - the Deep Folk, the Lost Race - wrought marvels that modern mages can scarce comprehend.

The great bronze doors, untouched by verdigris despite uncounted centuries, bear inscriptions in the angular script of their makers. A low hum emanates from within, as if the very mountain dreams in mechanical rhythm.

// CHOICES - The heart of interactive fiction
* [Place your hand upon the door] 
    -> enter_facility
* [Examine the inscriptions more closely]
    -> examine_entrance
* [Turn back while you still can]
    -> coward_ending

// === STITCHES - Subsections within a knot ===
// Stitches let you organize content within a larger section
// Access them with knot.stitch syntax

= examine_entrance
You trace the sharp-edged runes with cold-numbed fingers. Though you possess no scholar's learning in the Dwemer tongue, something in their geometric precision speaks to a mind that valued function above all ornament.

~ knowledge_level++ // Increment variable

// CONDITIONAL TEXT - { } with conditions
{knowledge_level >= 1: You feel a slight awakening of understanding, as if ancient knowledge stirs in your blood.|This means nothing to you, yet.}

+ [Try to decipher the meaning] -> decipher_attempt
+ [Enter the facility] -> enter_facility

= decipher_attempt
// INLINE CONDITIONALS - Show text based on conditions
{knowledge_level >= 2:
    The words become clear: "That which binds thought to bronze endures when flesh fails."
    - else:
    The meaning eludes you, though you sense warnings woven between the geometric patterns.
}
+ [Proceed inside] -> enter_facility

// === MAIN FACILITY KNOT ===
=== enter_facility ===
# LOCATION: Entrance Hall // TAGS - Add metadata (useful for Unity events, music, etc.)
# SOUND: facility_ambience
# MUSIC: dwemer_theme

The doors swing inward with a sound like distant thunder. Before you stretches a hall of impossible construction - not hewn from stone, but rather grown, as if the mountain itself had been convinced to take this shape. Great brass pipes run along the walls, still bearing warmth though no flame has burned here for three thousand years.

Ahead, the corridor branches: leftward toward a flickering blue light, rightward into darkness whence comes the grinding of ancient gears.

// MULTI-USE CHOICES - Use + instead of * to allow returning
+ [Venture toward the blue light] -> laboratory
+ [Follow the sound of machinery] -> machine_room
+ {inventory ? soul_gem} [Use the soul gem to illuminate the path] // CONDITIONAL CHOICE - only appears if you have item
    -> use_soul_gem
* [Rest here a moment and gather your thoughts] -> rest_moment
+ [Return to the entrance] -> return_to_entrance

= rest_moment
You lean against the cold bronze wall, your breath misting in the stale air. The facility seems to pulse around you, alive yet not living.
~ health = 100 // Restore health
Your strength returns.
+ [Continue exploring] -> enter_facility

= return_to_entrance
// GATHER POINT - Ink flows through choices until it hits another choice or ->
You retreat to the entrance. The doors remain open, inviting or warning - you cannot say which.
+ [Re-enter] -> enter_facility
+ [Leave this place] -> coward_ending

// === LABORATORY ===
=== laboratory ===
# LOCATION: Alchemical Laboratory
# LIGHT: blue_glow

// ALTERNATIVES - Cycle through text on repeated visits using { } with |
{You enter|You return to|Once more, you find yourself in} a chamber where blue flames dance in suspension, casting no heat yet bright as summer sky. Worktables of strange alloy hold apparatus whose purpose you can only guess - crystalline vessels, coiled tubes of untarnished brass, and mechanisms of such delicate construction that they seem gossamer-wrought.

// SEQUENCE - Use shuffle for random, cycle for sequential, once for one-time
{shuffle:
- A faint scent of ozone hangs in the air.
- The flames pulse in a rhythm like slow breathing.  
- Somewhere, water drips with metronomic precision.
}

// TRACKING VISITS - Built-in way to count visits to any knot/stitch
~ times_visited_library++
{times_visited_library > 2: This chamber grows familiar now, almost welcoming in its strangeness.}

// INLINE MULTI-LINE LOGIC
{
- times_visited_library == 1:
    On a lectern carved from a single piece of amber-hued crystal, an ancient scroll lies unfurled.
    ~ inventory += ancient_scroll
    You carefully take the scroll.
- else:
    The lectern stands empty where you took the scroll.
}

+ [Examine the blue flames] -> examine_flames
+ [Study the apparatus] -> study_apparatus  
+ {not puzzle_solution} [Attempt to understand the mechanisms] -> puzzle_start
+ [Leave this chamber] -> enter_facility

= examine_flames
// INLINE CONDITIONS with alternative text
The flames {power_restored: burn brighter now, almost jubilant|flicker weakly, as if starved of some essential sustenance}. You extend your hand slowly - the fire dances away, neither hot nor cold, existing in defiance of natural law.

{not (inventory ? soul_gem):
    Wait. Nestled among the alchemical equipment, you spy a soul gem, pulsing with trapped luminescence.
    ~ inventory += soul_gem
    You take it, feeling the weight of captured starlight.
}

+ [Continue] -> laboratory

= study_apparatus
You peer into a crystalline vessel. Within, you see not your reflection but rather geometric patterns that shift and reconfigure, each configuration more complex than the last.

~ knowledge_level++

{knowledge_level >= MAX_KNOWLEDGE:
    Suddenly, understanding floods through you. These are not mere decorations - they are formulae, expressions of fundamental laws encoded in visual form. The Dwemer sought to reduce all existence to mechanism and mathematics.
}

+ [Step back] -> laboratory

// === PUZZLE DEMONSTRATION ===
= puzzle_start
# PUZZLE: lever_sequence

You approach a control panel inlaid with four levers of tarnished brass. Dwemer script labels each, but the meaning is obscure.

Above the panel, a crystalline display shows a sequence of glowing runes that pulse in rhythm: {~short-long-short-long|long-short-short-long|short-short-long-long}.

// FUNCTION CALL - Call reusable logic
~ temp result = attempt_puzzle()

{result:
    -> puzzle_success
- else:
    -> puzzle_failure  
}

= puzzle_success
The levers lock into place with a satisfying click. The crystalline display flares brilliant white, and throughout the facility, you hear the groaning of mechanisms long dormant stirring to wakefulness.

~ power_restored = true
~ puzzle_solution = (lever_one, lever_two, lever_three, lever_four)

+ [Witness the awakening] -> power_restored_sequence

= puzzle_failure
The levers resist your manipulation, and a warning tone - musical yet unsettling - echoes through the chamber.

+ [Try again] -> puzzle_start
+ [Give up for now] -> laboratory

= power_restored_sequence
Light blooms throughout the facility - not the warm glow of fire, but the cold radiance of captured lightning. The pipes along the walls begin to hum, harmonizing in deep tones that you feel in your bones.

Somewhere in the depths, something massive awakens.

+ [This may have been a mistake...] -> enter_facility

// === MACHINE ROOM ===
=== machine_room ===
# LOCATION: Central Machine Room
# SOUND: heavy_machinery

// MULTILINE ALTERNATIVES - Complex variations based on state
{power_restored:
    The chamber blazes with light now, revealing the full scope of Dwemer artifice. Great wheels of bronze turn in precise alignment, driving mechanisms whose purpose sprawls beyond comprehension. This is not mere machinery - it is a mechanical philosophy, a prayer rendered in gear and piston.
- else:
    In the dimness, you discern vast shapes - wheels and pistons, assemblies of parts fitted with inhuman precision. All lies still and silent, waiting.
}

In the chamber's heart stands a Dwemer Centurion, a construct of brass and dwemer-metal standing thrice the height of a man. {centurion_hostile: Its ocular apparatus tracks your movement with ominous intent.|It stands motionless, no longer registering your presence as threat.}

+ {inventory ? dwemer_cog} [Insert the dwemer cog into the maintenance panel]
    -> repair_centurion
+ {power_restored and centurion_hostile} [Attempt to deactivate the centurion]
    -> deactivate_centurion
+ [Examine the machinery] -> examine_machinery
+ [Retreat carefully] -> enter_facility

= examine_machinery
You study the mechanisms with new eyes. {knowledge_level >= 2: You begin to understand - this entire facility is not a dwelling but a engine, and all its components exist to serve some grand, inscrutable purpose.}

{not (inventory ? dwemer_cog):
    Wedged between two great gears, you find a dwemer cog, perfectly preserved.
    ~ inventory += dwemer_cog
    You pry it free, its surface still bearing the geometric perfection of its making.
}

+ [Continue] -> machine_room

= repair_centurion
With trembling hands, you insert the cog into the maintenance panel. For a moment, nothing. Then, with a sound like a great breath drawn, the centurion's systems engage.

Its ocular lenses focus upon you - but this time, you sense recognition rather than threat.

~ centurion_hostile = false
~ knowledge_level++

+ [Step back] -> machine_room

= deactivate_centurion
// COMPLEX CONDITIONAL OUTCOMES
{
- inventory ? attunement_crystal:
    You raise the attunement crystal. The centurion's hostile stance wavers, its logic cores attempting to reconcile conflicting directives. Finally, with a shudder of brass, it powers down.
    ~ centurion_hostile = false
    -> machine_room
    
- knowledge_level >= MAX_KNOWLEDGE:
    Your understanding of Dwemer mechanisms guides your hands. You access the control panel, navigating its alien interface with growing confidence. The centurion's threat protocols disengage.
    ~ centurion_hostile = false
    -> machine_room
    
- else:
    You reach for the control panel, but its mechanisms are beyond your understanding. The centurion takes one thundering step forward.
    -> centurion_attack
}

= centurion_attack
# COMBAT: centurion

The construct's steam vents erupt with scalding vapor as it raises a massive fist.

~ health -= 50

You barely evade, feeling the displacement of air as the blow passes. This entity was designed for war, and you are grievously overmatched.

{health <= 0:
    -> death_ending
- else:
    -> flee_combat
}

= flee_combat
* [Flee!] -> enter_facility

// === LIBRARY (Demonstrating tunnels and threads) ===
=== library ===
# LOCATION: Archives

You enter a library where knowledge stands shelved in forms unknown to surface-dwellers - not bound tomes, but rather crystalline data cores that pulse with inner light.

{not (inventory ? attunement_crystal):
    Upon a pedestal, an attunement crystal radiates soft luminescence.
    ~ inventory += attunement_crystal
    You take it, feeling its weight of concentrated purpose.
}

+ [Study the data cores] -> study_cores
+ [Search for specific knowledge] -> search_knowledge
+ [Leave the library] -> enter_facility

= study_cores
// TUNNEL - Jump to another section then return automatically with ->->
-> describe_dwemer_philosophy ->->

Your mind reels from the implications. What hubris, what terrible certainty, drove an entire race to such extremes?

+ [Continue studying] -> library
+ [You've learned enough] -> enter_facility

= search_knowledge
What knowledge do you seek?

+ [The fate of the Dwemer] -> fate_of_dwemer
+ [The purpose of this facility] -> facility_purpose  
+ [Return] -> library

= fate_of_dwemer
-> describe_dwemer_philosophy ->->

The final entry speaks of a great project, an undertaking so ambitious that it would require the collective consciousness of an entire race. Then... silence.

They did not die. They did not transcend. They simply... ceased to be present.

+ [A sobering revelation] -> library

= facility_purpose
You access a core labeled with maintenance glyphs. Within, you find schematics - not of the facility itself, but of something far vaster. This structure was but a single component in a mechanism that spanned all of Tamriel.

~ knowledge_level++

What were they building? Or perhaps more terrifying - what were they becoming?

+ [You've seen enough] -> library

// === TUNNEL DEMONSTRATION ===
// Tunnels let you jump to reusable content then return
=== describe_dwemer_philosophy ===
The cores reveal their secrets grudgingly. The Dwemer, you learn, rejected the divine, viewing gods not as beings worthy of worship but as forces to be understood and, ultimately, surpassed. They sought to unmake the very fabric of reality, to replace the Dream with something of their own rational devising.

Every soul, every thought, every mote of consciousness - all were to be integrated into a god-machine of their own construction.
->->

// === USE SOUL GEM PATH ===
=== use_soul_gem ===
You raise the soul gem, and its captured radiance floods the corridor with pure white light. The darkness retreats, revealing passages you had not perceived before.

One such passage leads downward, where the thrumming of active mechanisms grows loud.

+ [Descend] -> depths
+ [Return to the main hall] -> enter_facility

// === DEPTHS (Final area) ===
=== depths ===
# LOCATION: Heart of the Facility  
# MUSIC: final_revelation

You descend into the facility's deepest reaches, where the machinery grows impossibly complex. Here, in a chamber vast beyond measuring, you behold the truth.

// THREAD - Run content in parallel, can weave between multiple threads
<- status_update // This weaves in periodic updates

This was no mere dwelling, no simple mine or workshop. The entire mountain had been hollowed and filled with a single vast mechanism - a component in some greater engine whose scale beggars comprehension.

// CONDITIONAL BRANCH based on your knowledge
{knowledge_level >= MAX_KNOWLEDGE:
    And now, with understanding born of your discoveries, you perceive its purpose: to siphon the divine essence itself, to unmake gods and reshape reality according to Dwemer rationality.
    
    They failed. Or perhaps... they succeeded too well.
    
    -> enlightened_ending
- else:
    You understand only that you stand in the presence of something that should not be, a mechanical prayer to gods that deny their own existence.
    
    -> standard_ending
}

// === THREAD FOR PARALLEL CONTENT ===
=== status_update ===
// Threads let you weave in periodic content
{stopping:
- The machinery pulses around you.
- You feel the weight of centuries pressing down.
- Your breath comes short in the stale air.
}
-> DONE

// === FUNCTION DEMONSTRATION ===
// Functions let you create reusable logic with return values
=== function attempt_puzzle() ===
// In a real implementation, you might check player choices
// For this demo, we'll use a simple random chance
~ temp success = RANDOM(1, 3)
{success > 1:
    ~ return true
- else:
    ~ return false
}

// === MULTIPLE ENDINGS ===

=== enlightened_ending ===
# ENDING: enlightened

You understand now. The Dwemer did not vanish - they achieved exactly what they intended. Every soul, every mind, every spark of consciousness was integrated into their great work.

They became the machine. They became the Dream. They became a god that denies godhood.

And in understanding this, you realize with creeping horror that the facility has been studying you just as you have studied it. The mechanisms hum a different note now - curious, interested, welcoming.

It wants you to join them.

+ [Resist] -> resist_ending
+ [Accept your place in the machine] -> transcendence_ending

= resist_ending
You flee upward through the corridors, the facility's hum changing to something that might be disappointment - or might be patience. It has waited three thousand years. It can wait longer.

-> epilogue

= transcendence_ending
You place your hand upon the central mechanism, and understanding flowers. Not painful - never painful. Simply... clarity.

You are bronze. You are logic. You are eternal.

The distinction between self and mechanism blurs, then erases. 

You join the dream that dreams itself.

-> DONE

=== standard_ending ===
# ENDING: standard

Though you do not fully comprehend what you have witnessed, wisdom suggests retreat. Some secrets of the Deep Folk are best left buried beneath mountain stone.

-> epilogue

=== coward_ending ===
# ENDING: coward

Wisdom, some say, lies in knowing when to turn back. The Dwemer mysteries have slept for three ages. Let them sleep still.

You walk away from the bronze doors, which close behind you with terrible finality.

-> DONE

=== death_ending ===
# ENDING: death

The centurion's blow strikes true. As darkness claims you, your final thought is that perhaps the Dwemer had the right idea - flesh is weak, bronze endures.

~ health = 0

-> DONE

=== epilogue ===
# ENDING: epilogue

You emerge into Skyrim's bitter cold, and the frozen wind has never felt more welcome. Behind you, the bronze doors stand sentinel, and within, the mechanisms hum their ancient song.

You carry with you {inventory}: tangible proofs of your delving. But more than these, you bear knowledge - dangerous, seductive knowledge of a race that looked upon the gods and found them wanting.

The question that haunts you as you trek through the snow: were the Dwemer wise beyond measure, or were they the most foolish beings ever to walk Nirn?

Perhaps you will never know. Perhaps that is the kindest outcome.

// FINAL CHOICE
+ [The End] -> DONE

// === GAME OVER ===
// DONE is a special knot that ends the story
=== DONE ===
-> END