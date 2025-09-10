0  CLS : KEY OFF: DIM OBJ$(28): DIM WEAR$(6): DIM OBJ(28)
10 PHP = 30: TROLL = 4: BANDI = 6.3: DRAGON = 15: OGRE = 30
100 PRINT "Cavern"
101 ROOM = 1
110 PRINT "You are in an underground cavern.  Tunnels lead north and south, and a hole     leads downward into darkness.  There is an inscription on the wall.  ";
111 IF OBJ(15) = 0 THEN PRINT "A lightbulb lies at your feet." ELSE PRINT
115 IF DRO$(ROOM) <> "" THEN PRINT "On the floor in this room is: "; DRO$(ROOM);
120 GOSUB 25000
130 IF A$ = "n" THEN GOTO 300
131 IF A$ = "s" THEN SOU = 1: GOTO 200
132 IF A$ = "d" THEN IF OBJ$(15) = "" THEN PRINT "Are you kidding?  It's dark down there!": GOTO 120 ELSE GOTO 400
140 IF A$ = "l" THEN GOTO 100
150 IF A$ = "g bulb" OR A$ = "g lightbulb" THEN IF OBJ(15) = 0 THEN PRINT "Taken.": OBJ(15) = 1: OBJ$(15) = "A lightbulb.  ": GOTO 120
160 IF A$ = "r inscription" THEN PRINT "`Find the merchant to fullfil your destiny.'": GOTO 120
180 GOSUB 26000
190 GOTO 120
200 PRINT "Tunnel"
201 ROOM = 2
210 PRINT "You are in a long tunnel with exits to the north and south."
220 GOSUB 25000
230 IF A$ = "l" THEN GOTO 200
240 IF A$ = "n" THEN SOU = SOU - 1: IF SOU = 0 THEN GOTO 100 ELSE GOTO 200
241 IF A$ = "s" THEN SOU = SOU + 1: GOTO 200
280 GOSUB 26000
290 GOTO 220
300 PRINT "Large Cavern"
301 ROOM = 3
310 PRINT "You are in a large cavern.  A massive oak door in the east wall stands "; : IF DOROPEN = 1 THEN PRINT "open." ELSE PRINT "closed."
311 PRINT "A tunnel leads south."
320 GOSUB 25000
330 IF A$ = "l" THEN GOTO 300
340 IF A$ = "s" THEN GOTO 100
341 IF A$ = "e" THEN IF DOROPEN = 0 THEN PRINT "The door is closed.": GOTO 320'ELSE GOTO
350 IF A$ = "o door" THEN IF UNLOK = 0 THEN PRINT "It's locked.": GOTO 320 ELSE IF DOROPEN = 1 THEN PRINT "It's already open.": GOTO 320 ELSE PRINT "The door creaks open on rusty hinges.": DOROPEN = 1: GOTO 320
351 IF A$ = "c door" AND DOROPEN = 1 THEN PRINT "After all that?  Forget it!": GOTO 320
352 IF A$ = "unlock door" AND UNLOK = 0 THEN IF OBJ$(25) = "" THEN PRINT "You don't have the key.": GOTO 320 ELSE PRINT "`Click!'  This is the moment we've all been waiting for...": UNLOK = 1: GOTO 320
353 IF A$ = "x door" THEN PRINT "A small sign is nailed to the massive oak door.  "; : IF DOROPEN = 1 THEN PRINT "It is open.": GOTO 320 ELSE PRINT "It is closed.": GOTO 320
354 IF A$ = "x sign" OR A$ = "r sign" THEN PRINT "`Exit'": GOTO 320
380 GOSUB 26000
390 GOTO 320
400 PRINT "Blue Room"
401 ROOM = 4
410 PRINT "The walls of this room are painted in a light shade of blue.  A small metal hookis fastened to the wall"; : IF WIST = 0 OR WIST = 2 THEN PRINT ", from which hangs a whistle.";  ELSE PRINT ".";
411 PRINT "  A stairway leads up to a "; "hole in the ceiling, and a "; "tunnel leads east."
420 GOSUB 25000
430 IF A$ = "l" THEN GOTO 400
440 IF A$ = "e" THEN GOTO 500
441 IF A$ = "u" THEN GOTO 100
450 IF A$ = "g whistle" THEN OBJ(16) = 1: IF WIST = 0 OR WIST = 2 THEN PRINT "Taken.": IF WIST = 0 THEN WIST = 1: OBJ$(16) = "A steel whistle.  ": GOTO 420 ELSE WIST = 3: OBJ$(16) = "A pair of whistles.  ": GOTO 420
451 IF A$ = "             " THEN : GOTO 420
480 GOSUB 26000
490 GOTO 420
500 PRINT "Dungeon"
501 ROOM = 5
510 PRINT "This room is filled with large torture implements.  The remains of one hapless  adventurer are still on the rack.  Exits lead north, south, and west.  ";
511 IF OBJ(1) = 0 THEN PRINT "A large": PRINT "mace lies on the ground nearby." ELSE PRINT
520 GOSUB 25000
530 IF A$ = "l" THEN GOTO 500
540 IF A$ = "w" THEN GOTO 400
541 IF A$ = "n" THEN GOTO 600
542 IF A$ = "s" THEN GOTO 1800
545 IF A$ = "g all" THEN IF OBJ(1) = 0 AND OBJ(10) = 0 THEN PRINT "Mace and Medallion taken.": OBJ(1) = 1: OBJ(10) = 1: OBJ$(1) = "A mace.  ": OBJ$(10) = "A silver medallion.  ": GOTO 520
550 IF A$ = "x adventurer" OR A$ = "x man" THEN IF OBJ(10) = 0 THEN PRINT "Around the man's neck is a silver medallion.": GOTO 520 ELSE PRINT "He is in rather poor shape.": GOTO 520
551 IF A$ = "g mace" AND OBJ(1) = 0 THEN PRINT "Taken.": OBJ(1) = 1: OBJ$(1) = "A mace.  ": GOTO 520
552 IF A$ = "g medallion" AND OBJ(10) = 0 THEN PRINT "Taken.": OBJ(10) = 1: OBJ$(10) = "A silver medallion.  ": GOTO 520
580 GOSUB 26000
590 GOTO 520
600 PRINT "River Room"
601 ROOM = 6
610 PRINT "A wide river cuts across the room to the west.  tunnels lead north, west, and   south.  ";
611 IF OBJ(17) = 0 THEN PRINT "There is a canteen here." ELSE PRINT
620 GOSUB 25000
630 IF A$ = "l" THEN GOTO 600
640 IF A$ = "n" THEN GOTO 800
641 IF A$ = "s" THEN GOTO 500
642 IF A$ = "e" THEN GOTO 700
'643 IF A$ = "w" THEN
650 IF A$ = "g canteen" AND OBJ(17) = 0 THEN PRINT "Taken.": OBJ(17) = 1: OBJ$(17) = "A canteen.  ": GOTO 620
651 IF A$ = "fill canteen" AND OBJ(17) = 1 THEN IF CANT = 0 THEN PRINT "You fill the canteen with water from the river.": CANT = 1: GOTO 620 ELSE PRINT "It's already full.": GOTO 620
652 IF A$ = "x river" THEN PRINT "A sign is posted in the middle of the river.": GOTO 620
653 IF A$ = "x sign" OR A$ = "r sign" THEN PRINT "`No Swimming'": GOTO 620
680 GOSUB 26000
690 GOTO 620
700 PRINT "Greenhouse"
701 ROOM = 7
710 PRINT "Hot lights shine on a bunch of wilted plants in pots.  The only exit leads west.";
720 GOSUB 25000
730 IF A$ = "l" THEN GOTO 700
740 IF A$ = "w" THEN GOTO 600
750 IF LEFT$(A$, 7) = "x plant" THEN PRINT "The plants look like they need to be watered.": GOTO 720
751 IF LEFT$(A$, 11) = "water plant" AND CANT = 0 THEN PRINT "You don't have any water.": GOTO 720
752 IF LEFT$(A$, 11) = "water plant" AND CANT = 1 THEN PRINT "The plants soak up the water from your canteen, but nothing interesting happens."; : CANT = 0: GOTO 720
753 IF LEFT$(A$, 11) = "water plant" THEN PRINT "The plants begin to grow to tremendous proportions as you pour the sparkling    water over them, but soon wither away to their original state.": CANT = 0: GOTO 720
754 IF A$ = "             " THEN : GOTO 720
755 IF A$ = "             " THEN : GOTO 720
780 GOSUB 26000
790 GOTO 720
800 PRINT "Stone Room"
801 ROOM = 8
810 PRINT "You are in a small room roughly carved from solid stone.  The only exit leads   south.  "; : IF WEAR$(1) <> "" AND BANDITO = 1 THEN PRINT "The east wall seems to shimmer in the light of your lightbulb.";
811 IF BANDITO = 0 THEN PRINT "There is a bandit here.";
812 PRINT
820 GOSUB 25000
821 IF BANDITO = 0 THEN GOSUB 41000
822 IF LEFT$(A$, 2) = "k " THEN GOTO 820
830 IF A$ = "l" THEN GOTO 800
840 IF A$ = "e" THEN IF BANDITO = 1 THEN GOTO 900 ELSE PRINT "The bandit is in your way.": GOTO 820
841 IF A$ = "s" THEN PRINT : GOTO 600
850 IF A$ = "x bandit" AND BANDITO = 0 THEN PRINT "He looks mean.": GOTO 820
851 IF A$ = "x wall" AND BANDITO = 1 AND WEAR$(1) <> "" THEN PRINT "You can just make out the outline of what looks like a doorway.": GOTO 820
880 GOSUB 26000
890 GOTO 820
900 PRINT "Treasure Room"
901 ROOM = 9
910 PRINT "The room is filled to the ceiling with all sorts of interesting trinkets and    treasures, not to mention traps.  A shimmering doorway leads west.  ";
911 IF DISARM = 0 THEN PRINT "There is "; "a sword here.  Tied to it is a string."
912 IF DISARM = 1 AND OBJ(3) = 0 THEN PRINT "There is "; "a sword here."
913 IF DISARM = 1 AND OBJ(3) > 0 THEN PRINT
920 GOSUB 25000
930 IF A$ = "l" THEN GOTO 900
940 IF A$ = "w" THEN GOTO 800
950 IF A$ = "x string" AND DISARM = 0 THEN PRINT "The string runs into a small hole in the wall.": GOTO 920
951 IF A$ = "cut string" THEN IF OBJ(4) = 0 THEN PRINT "Disarming traps requires precision instruments.": GOTO 920 ELSE PRINT "You carefully slice through the string with your knife.  It reels itself into   the hole in the wall.": DISARM = 1: GOTO  _
920
952 IF A$ = "g sword" AND DISARM = 0 THEN PRINT "The string pulls taut as you pick up the sword.  A massive explosion fills the  room, engulfing you in flame.  Oops.": GOTO 35000
953 IF A$ = "g sword" AND OBJ(3) = 0 THEN PRINT "Taken.": OBJ(3) = 1: OBJ$(3) = "A sword.  ": GOTO 920
980 GOSUB 26000
990 GOTO 920
1000 PRINT "Glass Room"
1001 ROOM = 10
1010 PRINT "The floor of this room is made of a transparent substance, not entirely unlike  glass.  There is an exit to the east and a spiral staircase leading down.": IF TROL = 0 THEN PRINT  _
"Through the floor a evil troll can be seen lurking about."
1011 IF TROL = 1 AND OBJ(2) = 0 THEN PRINT "Through the floor you can see an axe in the room below."
1020 GOSUB 25000
1030 IF A$ = "l" THEN GOTO 1000
1040 IF A$ = "e" THEN GOTO 1800
1050 IF A$ = "             " THEN : GOTO 1020
1060 IF A$ = "d" THEN GOTO 1100
1080 GOSUB 26000
1090 GOTO 1020
1100 PRINT "Troll Room"
1101 ROOM = 11
1110 PRINT "You are small room with exits to the east and west.  There is a glass staircase leading up.  Deep scratches and bloodstains cover the walls.  ";
1111 IF TROL = 0 THEN PRINT "An evil troll": PRINT "with a big axe is lurking around the room." ELSE IF OBJ(2) = 0 THEN PRINT "A bloodstained": PRINT "axe lies at your feet." ELSE PRINT
1120 GOSUB 25000
1121 IF TROL = 0 THEN GOSUB 40000
1122 IF TROL = 0 AND LEFT$(A$, 2) = "k " THEN GOTO 1120
1123 IF BOB = 1 THEN BOB = 0: GOTO 1120
1130 IF A$ = "l" THEN GOTO 1100
1140 IF A$ = "u" THEN GOTO 1000
1150 IF A$ = "g axe" THEN IF OBJ(2) = 0 AND TROL = 1 THEN PRINT "Taken.": OBJ$(2) = "An axe.  ": OBJ(2) = 1: GOTO 1120
1155 IF A$ = "w" THEN IF TROL = 0 THEN PRINT "The troll leaps nimbly into your path.": GOTO 1120
1160 IF A$ = "w" THEN GOTO 1200
1161 IF A$ = "x troll" THEN PRINT "He looks like he could do some serious damage with that axe.": GOTO 1120
1170 IF A$ = "e" THEN GOTO 1300
1180 GOSUB 26000
1190 GOTO 1120
1200 PRINT "Yellow Room"
1201 ROOM = 12
1205 IF WEAR$(1) = "" THEN PRINT "This room is too bright!": PRINT : GOTO 1100
1210 PRINT "The walls of this room are painted a bright yellow.  There are exits to the eastand to the north.  "; : IF OBJ(19) = 0 THEN PRINT "The eyestrain caused by the color of the walls is increased": PRINT  _
"by a bright sphere in the center of the room.";
1211 IF OBJ(14) = 0 THEN PRINT "  There is a statue here." ELSE PRINT
1220 GOSUB 25000
1230 IF A$ = "l" THEN GOTO 1200
1240 IF A$ = "e" THEN GOTO 1100
1250 IF A$ = "g statue" AND OBJ(14) = 0 THEN OBJ(14) = 1: OBJ$(14) = "A golden statue.  ": PRINT "Taken.": GOTO 1220
1251 IF A$ = "g sphere" AND OBJ(19) = 0 THEN OBJ(19) = 1: OBJ$(19) = "A bright sphere.  ": PRINT "Taken.": GOTO 1220
1252 IF A$ = "g all" AND OBJ(19) = 0 AND OBJ(14) = 0 THEN OBJ(19) = 1: OBJ(14) = 1: OBJ$(19) = "A bright sphere.  ": OBJ$(14) = "A golden statue.  ": PRINT "Gold statue and sphere taken.": GOTO 1220
1260 IF A$ = "n" THEN GOTO 1400
1270 IF A$ = "u" THEN GOTO 1500
1280 GOSUB 26000
1290 GOTO 1220
1300 PRINT "Crypt"
1301 ROOM = 13
1310 PRINT "You are in a old abandoned crypt.  There are exits to the east and north.  The  smell of vinalla is strong here.  "; : IF OBJ(18) = 0 THEN PRINT "There is a pile of rags here." ELSE PRINT
1320 GOSUB 25000
1330 IF A$ = "l" THEN GOTO 1300
1340 IF A$ = "n" THEN GOTO 1100
1350 IF A$ = "g rags" THEN IF OBJ(5) = 0 THEN PRINT "Taken.  Suprize!  You found a pair of sunglasses in the rags.": OBJ(5) = 1: OBJ(18) = 1: OBJ$(18) = "Some rags.  ": OBJ$(5) = "A pair of sunglasses.  ": GOTO 1320
1360 IF A$ = "e" THEN GOTO 1600
1370 IF A$ = "g sunglasses" THEN IF OBJ(5) = 0 THEN PRINT "Gee, have you played this before?": GOTO 1320
1380 GOSUB 26000
1390 GOTO 1320
1400 PRINT "White Room"
1401 ROOM = 14
1410 PRINT "You are in a white room with pretty black curtains over the window.  There is a large control panel in the middle of the room which appears to be securely      bolted to the floor.  ";
1411 IF DRAGON = 1 THEN PRINT "A big dragon is glaring at you maliciously, yet drowsiliy."; : PRINT  ELSE IF DRAGON = 0 THEN PRINT "A large dragon naps nearby." ELSE IF OBJ(23) = 0 THEN PRINT "There is a sheet of music here." ELSE PRINT
1420 GOSUB 25000
1421 IF DRAGON = 1 THEN GOSUB 42000
1422 IF A$ = "k dragon" AND DRAGON = 0 THEN PRINT "The dragon opens an eye and rises to meet your insolence.": DRAGON = 1: GOTO 1420
1423 IF LEFT$(A$, 2) = "k " AND DRAGON < 2 THEN GOTO 1420
1430 IF A$ = "l" THEN GOTO 1400
1440 IF A$ = "s" THEN GOTO 1200
1450 IF A$ = "x panel" THEN PRINT "There is a bucket type part on the machine.  It is labeled,                     `Infinite Improbability Drive'": GOTO 1420
1460 IF A$ = "w" THEN GOTO 1700
1470 IF A$ = "p tea into bucket" OR LEFT$(A$, 13) = "pour tea into" THEN IF OBJ$(20) = "A cup of tea.  " THEN PRINT "A blinding flash of light, which forces you out of the room, engulfs the dragon."; : OBJ$(20) = "A tea cup.  ": DRAGON = 2: GOTO  _
1200
1475 IF A$ = "g sheet" OR A$ = "g music" THEN IF OBJ(23) = 0 THEN OBJ(23) = 1: OBJ$(23) = "A sheet of music.  ": PRINT "Taken.": GOTO 1420
1476 IF A$ = "x dragon" AND DRAGON <> 2 THEN PRINT "Gee, is that a solitary chink in his armor behind his left ear, the only place  where he might be vulnerable?": GOTO 1420
1477 IF RIGHT$(A$, 8) = "left ear" THEN PRINT "I guess not.": GOTO 1420
1480 GOSUB 26000
1490 GOTO 1420
1500 PRINT "Pointless Room"
1501 ROOM = 15
1510 PRINT "              "
1520 GOSUB 25000
1530 IF A$ = "l" THEN GOTO 1500
1540 IF A$ = "d" THEN GOTO 1200
1550 IF A$ = "             " THEN : GOTO 1520
1580 GOSUB 26000
1590 GOTO 1520
1600 PRINT "Whisper Room"
1601 ROOM = 16
1610 PRINT "There are exits to the west, north, and northeast.  There is a constant whisper-ing here."
1620 GOSUB 25000
1630 IF A$ = "l" THEN GOTO 1600
1640 IF A$ = "w" THEN GOTO 1300
1650 IF QWEX = 0 THEN IF A$ = "listen" THEN PRINT "You here a voice say `Rivers are good for swimming'": QWEX = 1: GOTO 1620
1655 IF A$ = "listen" THEN PRINT "You here nothing special.": GOTO 1620
1660 IF A$ = "n" THEN GOTO 2000
1661 IF A$ = "ne" THEN GOTO 1900
1680 GOSUB 26000
1690 GOTO 1620
1700 PRINT "Wizard's Room"
1701 ROOM = 17
1710 PRINT "There are doorways in this room to the east and west.  To the south there is a  magical box."
1720 GOSUB 25000
1730 IF A$ = "l" THEN GOTO 1700
1740 IF A$ = "e" THEN GOTO 1400
1741 IF A$ = "w" THEN GOTO 2100
1750 IF A$ = "x box" THEN PRINT "It is a red box with gold etchings in the side.  It is big enough to stand in.": GOTO 1720
1760 IF A$ = "g box" THEN PRINT "It is much to big and heavy for you to take.": GOTO 1720
1770 L = INSTR(A$, "in "): IF L <> 0 THEN GOTO 2200
1780 GOSUB 26000
1790 GOTO 1720
1800 PRINT "Tea Room"
1801 ROOM = 18
1810 PRINT "There is a huge mural on the east wall.  There are exits to the west and north.": IF OBJ(20) = 0 THEN PRINT "There is a cup of tea here."
1820 GOSUB 25000
1830 IF A$ = "l" THEN GOTO 1800
1840 IF A$ = "w" THEN GOTO 1000
1841 IF A$ = "n" THEN GOTO 500
1850 IF A$ = "g tea" OR A$ = "g cup" THEN IF OBJ(20) = 0 THEN PRINT "Taken.": OBJ(20) = 1: OBJ$(20) = "A cup of tea.  ": GOTO 1820
1860 IF A$ = "x mural" THEN PRINT "It is a detailed depiction of a giant dragon.": GOTO 1820
1880 GOSUB 26000
1890 GOTO 1820
1900 PRINT "Maze"
1901 ROOM = 19
1910 PRINT "You are in a non-descript passage with exits to the south, east, and southwest."
1920 GOSUB 25000
1930 IF A$ = "l" THEN GOTO 1900
1940 IF A$ = "sw" THEN GOTO 1600
1990 GOSUB 26000
1999 GOTO 1910
2000 PRINT "Maze"
2001 ROOM = 20
2010 PRINT "You are in a non-descript passage with exits to the north and south."
2020 GOSUB 25000
2030 IF A$ = "l" THEN GOTO 2000
2040 IF A$ = "s" THEN GOTO 1600
2090 GOSUB 26000
2099 GOTO 1910
2100 PRINT "North/South Passage"
2101 ROOM = 21
2110 PRINT "You are in a non-descript passage with exits to the north and south."
2120 GOSUB 25000
2130 IF A$ = "l" THEN GOTO 2100
2140 IF A$ = "s" THEN GOTO 1700
2190 GOSUB 26000
2199 GOTO 2110
2200 PRINT "In a box"
2201 ROOM = 22
2301 ROOM = 23
25000 INPUT "> ", A$: MV = 0: PRINT : MOVES = MOVES + 1
25010 IF A$ = "" THEN PRINT "Pardon me?": GOTO 25000
25020 FOR T = 1 TO LEN(A$)
25030 B$ = MID$(A$, T, 1): IF ASC(B$) > 64 AND ASC(B$) < 91 THEN B$ = CHR$(ASC(B$) + 32)
25040 D$ = D$ + B$
25050 NEXT T
25060 A$ = D$: D$ = ""
25070 IF A$ = "again" OR A$ = "a" THEN A$ = Z$
25080 Z$ = A$
25090 IF A$ = "quit" OR A$ = "q" THEN END
25100 IF A$ = "look" OR A$ = "l" THEN A$ = "l": RETURN
25110 IF RIGHT$(A$, 3) = " it" THEN K$ = LEFT$(A$, LEN(A$) - 3): A$ = K$ + " " + IT$
25120 IF LEFT$(A$, 3) = "go " THEN A$ = MID$(A$, 4, 50)
25130 IF LEFT$(A$, 5) = "walk " THEN A$ = MID$(A$, 6, 50)
25140 IF LEFT$(A$, 4) = "say " THEN A$ = MID$(A$, 5, 50)
25150 IF A$ = "north" OR A$ = "n" THEN A$ = "n": MV = 1
25160 IF A$ = "northeast" OR A$ = "ne" THEN A$ = "ne": MV = 1
25170 IF A$ = "northwest" OR A$ = "nw" THEN A$ = "nw": MV = 1
25180 IF A$ = "south" OR A$ = "s" THEN A$ = "s": MV = 1
25190 IF A$ = "southeast" OR A$ = "se" THEN A$ = "se": MV = 1
25200 IF A$ = "southwest" OR A$ = "sw" THEN A$ = "sw": MV = 1
25210 IF A$ = "east" OR A$ = "e" THEN A$ = "e": MV = 1
25220 IF A$ = "west" OR A$ = "w" THEN A$ = "w": MV = 1
25230 IF A$ = "up" OR A$ = "u" THEN A$ = "u": MV = 1
25240 IF A$ = "down" OR A$ = "d" THEN A$ = "d": MV = 1
25250 IF LEFT$(A$, 4) = "get " THEN ZT$ = MID$(A$, 5, 50): A$ = "g " + ZT$
25260 IF LEFT$(A$, 5) = "take " THEN ZT$ = MID$(A$, 6, 50): A$ = "g " + ZT$
25270 IF LEFT$(A$, 8) = "examine " THEN ZT$ = MID$(A$, 9, 50): A$ = "x " + ZT$
25280 IF LEFT$(A$, 5) = "look " THEN ZT$ = MID$(A$, 6, 50): A$ = "x " + ZT$
25290 IF LEFT$(A$, 5) = "x at " THEN ZT$ = MID$(A$, 6, 50): A$ = "x " + ZT$
25300 IF LEFT$(A$, 5) = "x in " THEN ZT$ = MID$(A$, 6, 50): A$ = "x in " + ZT$
25310 IF LEFT$(A$, 5) = "x on " THEN IT$ = MID$(A$, 6, 50): A$ = "x on " + ZT$
25320 IF LEFT$(A$, 4) = "put " THEN IT$ = MID$(A$, 5, 50): A$ = "p " + IT$
25330 IF LEFT$(A$, 5) = "open " THEN IT$ = MID$(A$, 6, 50): A$ = "o " + IT$
25340 IF LEFT$(A$, 5) = "p on " THEN IT$ = MID$(A$, 6, 50): A$ = "w " + IT$
25350 IF LEFT$(A$, 6) = "close " THEN IT$ = MID$(A$, 7, 50): A$ = "c " + IT$
25360 IF LEFT$(A$, 5) = "talk " THEN IT$ = MID$(A$, 6, 50): A$ = "t " + IT$
25370 IF LEFT$(A$, 5) = "t to " THEN IT$ = MID$(A$, 6, 50): A$ = "t " + IT$
25380 IF LEFT$(A$, 7) = "attack " THEN IT$ = MID$(A$, 8, 50): A$ = "k " + IT$
25390 IF LEFT$(A$, 7) = "remove " THEN IT$ = MID$(A$, 8, 50): A$ = "uw " + IT$
25400 IF LEFT$(A$, 5) = "kill " THEN IT$ = MID$(A$, 6, 50): A$ = "k " + IT$
25410 IF LEFT$(A$, 6) = "g off " THEN IT$ = MID$(A$, 7, 50): A$ = "uw " + IT$
25420 IF LEFT$(A$, 6) = "fight " THEN IT$ = MID$(A$, 7, 50): A$ = "k " + IT$
25430 IF LEFT$(A$, 5) = "wear " THEN IT$ = MID$(A$, 6, 50): A$ = "w " + IT$
25440 IF LEFT$(A$, 5) = "read " THEN IT$ = MID$(A$, 6, 50): A$ = "r " + IT$
25445 IF LEFT$(A$, 6) = "wield " THEN GOSUB 50000: GOTO 25000
25450 IF A$ = "inventory" OR A$ = "inv" THEN A$ = "i"
25451 IF LEFT$(A$, 2) = "x " OR LEFT$(A$, 2) = "g " THEN IT$ = MID$(A$, 3, 50)
25452 IF RIGHT$(A$, 3) = " it" THEN B$ = LEFT$(A$, LEN(A$) - 3): A$ = B$ + IT$
25455 IF A$ = "help" THEN GOSUB 56000: RETURN
25460 IF A$ = "i" THEN GOSUB 25900
25461 IF LEFT$(A$, 5) = "drop " THEN TEMP$ = MID$(A$, 6, 255): A$ = "d " + TEMP$
25462 KEY 1, A$
25470 RETURN
25900 PRINT "You take stock of your possessions...": WR = 0: HD = 0: WD = 0
25910 FOR INVCHEK = 1 TO 28:
        IF OBJ$(INVCHEK) <> "" THEN PRINT "You are carrying:  "; : GOTO 25920
      NEXT INVCHEK: HD = 1: GOTO 25930
25920 FOR INVPRT = 1 TO 28: PRINT OBJ$(INVPRT); : NEXT INVPRT: PRINT
25930 FOR WEARCHEK = 1 TO 6:
        IF WEAR$(WEARCHEK) <> "" THEN PRINT "You are wearing:  "; : GOTO 25940
      NEXT WEARCHEK: WR = 1: GOTO 25950
25940 FOR WEARPRT = 1 TO 6: PRINT WEAR$(WEARPRT); : NEXT WEARPRT: PRINT
25950 IF WIELD$ = "" THEN WD = 1: GOTO 25960 ELSE PRINT "You are wielding:  "; WIELD$
25960 IF WD = 1 AND WR = 1 AND HD = 1 THEN PRINT "You don't have anything."
25970 GOSUB 51000
26000 IF A$ = "i" THEN RETURN
26001 IF A$ = "x mace" AND OBJ(1) = 1 THEN PRINT "A large, heavy implement, used primarily for clobbering things.": RETURN
26002 IF A$ = "x axe" AND OBJ(2) = 1 THEN PRINT "The well-worn blade of this large axe is inscribed with the name `H.P. Troll'.": RETURN
26003 IF A$ = "x sword" AND OBJ(3) = 1 THEN PRINT "A fine longsword of Elvish workmanship, with a razor-sharp blade and a hilt     encrusted with precious jewels.": RETURN
26004 IF A$ = "x knife" AND OBJ(4) = 1 THEN PRINT "The blade of this knife appears old and rusty, as though it has not been used inquite some time.": RETURN
26005 IF A$ = "x sunglasses" AND OBJ(5) = 1 THEN PRINT "An ordinary pair of dark sunglasses.": RETURN
26006 IF A$ = "x air tank" OR A$ = "x tank" THEN IF OBJ(6) = 1 THEN PRINT "A small tank of oxygen, not entirely unlike those worn by the SCUBA Divers'     Guild of West Grottle.": RETURN
26007 IF A$ = "x watch" AND OBJ(7) = 1 THEN PRINT "A gold watch, seemingly of Gnomish craftsmanship.  The hands move with amazing  swiftness and precision.  On the back is inscribed `Crafted by H.P. Clocksmith'."; : RETURN
26008 IF A$ = "x necklace" AND OBJ(8) = 1 THEN PRINT "An exquisite strand of gleaming pearls.": RETURN
26009 IF A$ = "x ring" AND OBJ(9) = 1 THEN PRINT "A gold band set with a brilliant diamond.": RETURN
26010 IF A$ = "x medallion" AND OBJ(10) = 1 THEN PRINT "A plain silver medallion with no distinguishing features.": RETURN
26011 IF A$ = "x coffer" AND OBJ(11) = 1 THEN PRINT "The lid of this small pewter coffer is covered with sapphires and emeralds.  It is closed.": RETURN
26012 IF A$ = "x book" AND OBJ(12) = 1 THEN PRINT "The black leather cover is embossed with the title and author of the book in    gold letters...`How to Do the VooDoo That the Zulu Do to You-A Study of Magic byH.P. Wizard'.": RETURN
26013 IF A$ = "x coin" AND OBJ(13) = 1 THEN PRINT "A gold shilling from the Golden Age of the fabled city of Istmas.": RETURN
26014 IF A$ = "x statue" AND OBJ(14) = 1 THEN PRINT "A small golden statue crafted in the shape of a man, but without much detail.": RETURN
26015 IF A$ = "x lightbulb" OR A$ = "x bulb" THEN IF OBJ(15) = 1 THEN PRINT "The lightbulb gives off a bright light, even in spite of its not being screwed  into anything.": RETURN
26016 IF LEFT$(A$, 9) = "x whistle" THEN IF WIST = 1 OR WIST = 2 THEN PRINT "A small steel whistle.": RETURN ELSE IF WIST = 3 THEN PRINT "A pair of identical steel whistles.": RETURN
26017 IF A$ = "x canteen" THEN IF OBJ(17) = 1 THEN IF CANT = 0 THEN PRINT "A small metal canteen.": RETURN ELSE PRINT "A small metal canteen filled with water.": RETURN
26018 IF LEFT$(A$, 5) = "x rag" AND OBJ(18) = 1 THEN PRINT "A bundle of dirty, torn strips of cloth.": RETURN
26019 IF A$ = "x sphere" AND OBJ(19) = 1 THEN IF WEAR$(1) = "" THEN PRINT "The sphere is so bright, you can't look directly at it.": RETURN ELSE PRINT  _
"A sphere of polished crystal glows with a brightness unmatched by anything you  have ever seen before.": RETURN
26020 IF A$ = "x tea" AND OBJ(20) = 1 THEN PRINT "The hot tea smells very strong.": RETURN ELSE IF A$ = "x cup" AND OBJ(20) > 0 THEN PRINT "A bone china teacup.  "; : IF OBJ(20) = 1 THEN PRINT "It is filled with hot tea.": RETURN ELSE IF OBJ(20) = 2 _
 THEN PRINT : RETURN
26021 IF A$ = "x rod" AND OBJ(21) = 1 THEN PRINT "The narrow steel rod is about four feet long.": RETURN
26022 IF A$ = "x honey" OR A$ = "x jar" THEN IF OBJ(22) = 1 THEN PRINT "The glass jar is full of sweet, sticky honey.": RETURN
26023 IF A$ = "x music" OR A$ = "x sheet music" OR A$ = "x sheet of music" THEN IF OBJ(23) = 1 THEN PRINT "A flute solo entitled `Music to Sack Empires By', by H.P. Composer.": RETURN
26024 IF A$ = "x flute" AND OBJ(24) = 1 THEN PRINT "This silver flute has the name `H.P. Musician' inscribed along its length.": RETURN
26025 IF A$ = "x key" AND OBJ(25) = 1 THEN PRINT "Inscribed upon the handle of this plain brass key is `H.P. Locksmith and Sons'.": RETURN
26026 IF A$ = "x wand" AND OBJ(26) = 1 THEN PRINT "A slender ebony wand with a white tip.": RETURN
26027 IF A$ = "x flask" OR A$ = "x whiskey" THEN IF OBJ(27) = 1 THEN PRINT "The glass flask is half-filled with a light amber liquid.  A label on the flask reads `Ole Red-Eye - 200 Proof'.": RETURN
26028 IF A$ = "x shield" AND OBJ(28) = 1 THEN PRINT "A blazing silver sun is embossed on the front of the bronze shield, and on the  back is the inscription `H.P. Warrior'.": RETURN
26029 IF A$ = "x           " AND OBJ(X) = 1 THEN PRINT "               ": RETURN
26030 IF A$ = "x           " AND OBJ(X) = 1 THEN PRINT "               ": RETURN
26040 IF A$ = "w sunglasses" AND OBJ$(5) <> "" AND WEAR$(1) = "" THEN SWAP OBJ$(5), WEAR$(1): PRINT "You slip on the sunglasses.  Everything looks darker.": RETURN
26041 IF A$ = "w air tank" OR A$ = "w tank" THEN IF OBJ$(6) <> "" AND WEAR$(2) = "" THEN SWAP OBJ$(2), WEAR$(1): PRINT "You strap on the air tank.": RETURN
26042 IF A$ = "w watch" AND OBJ$(7) <> "" AND WEAR$(3) = "" THEN SWAP OBJ$(7), WEAR$(3): PRINT "You put on the watch.": RETURN
26043 IF A$ = "w necklace" AND OBJ$(8) <> "" AND WEAR$(4) = "" THEN SWAP OBJ$(8), WEAR$(4): PRINT "You slip on the necklace.": RETURN
26044 IF A$ = "w ring" AND OBJ$(9) <> "" AND WEAR$(5) = "" THEN SWAP OBJ$(9), WEAR$(5): PRINT "You slide the ring onto your finger.": RETURN
26045 IF A$ = "w medallion" AND OBJ$(10) <> "" AND WEAR$(6) = "" THEN SWAP OBJ$(10), WEAR$(6): PRINT "You slip on the medallion.": RETURN
26060 IF A$ = "uw sunglasses" AND OBJ$(5) = "" AND WEAR$(1) <> "" THEN SWAP OBJ$(5), WEAR$(1): PRINT "You slip off the sunglasses.  Everything looks brighter.": RETURN
26061 IF A$ = "uw air tank" OR A$ = "w tank" THEN IF OBJ$(6) = "" AND WEAR$(2) <> "" THEN SWAP OBJ$(2), WEAR$(1): PRINT "You remove the air tank.": RETURN
26062 IF A$ = "uw watch" AND OBJ$(7) = "" AND WEAR$(3) <> "" THEN SWAP OBJ$(7), WEAR$(3): PRINT "You take off the watch.": RETURN
26063 IF A$ = "uw necklace" AND OBJ$(8) = "" AND WEAR$(4) <> "" THEN SWAP OBJ$(8), WEAR$(4): PRINT "You slip off the necklace.": RETURN
26064 IF A$ = "uw ring" AND OBJ$(9) = "" AND WEAR$(5) <> "" THEN SWAP OBJ$(9), WEAR$(5): PRINT "You slide the ring off your finger.": RETURN
26065 IF A$ = "uw medallion" AND OBJ$(10) = "" AND WEAR$(6) <> "" THEN SWAP OBJ$(10), WEAR$(6): PRINT "You slip off the medallion.": RETURN
26080 IF A$ = "drink water" THEN IF CANT = 0 THEN PRINT "You don't have any water.": RETURN ELSE IF CANT = 2 THEN PRINT "Ack!  The water burns going down, and you collapse on the floor in a dead heap.": GOTO 35000
26081 IF A$ = "drink water" THEN CANT = 0: PRINT "That was refreshing!": PHP = PHP + 4: IF PHP > 30 THEN PHP = 30: RETURN ELSE RETURN
26082 IF A$ = "            " THEN : RETURN
26083 IF A$ = "            " THEN : RETURN
26084 IF A$ = "            " THEN : RETURN
26085 IF A$ = "            " THEN : RETURN
26086 IF A$ = "            " THEN : RETURN
26087 IF A$ = "            " THEN : RETURN
26088 IF A$ = "            " THEN : RETURN
26089 IF A$ = "            " THEN : RETURN
26090 IF LEFT$(A$, 2) = "d " THEN GOSUB 27000: RETURN
26091 IF A$ = "            " THEN : RETURN
26092 IF A$ = "            " THEN : RETURN
26093 IF A$ = "            " THEN : RETURN
26094 IF A$ = "            " THEN : RETURN
26095 IF A$ = "            " THEN : RETURN
26096 IF A$ = "            " THEN : RETURN
26097 IF A$ = "            " THEN : RETURN
'26098 IF A$ = "            " THEN : GOTO 25001
26100 IF A$ = "moves" THEN PRINT "You have made"; MOVES; "moves to this point.": RETURN
26120 IF A$ = "health" OR A$ = "diagnose" OR A$ = "x self" THEN GOSUB 51000: RETURN
26140 IF A$ = "z" OR A$ = "wait" THEN PRINT "Time passes.": RETURN
26160 IF LEFT$(A$, 2) = "x " THEN PRINT "You see nothing special.": RETURN
26180 IF LEFT$(A$, 2) = "g " THEN PRINT "You can't take that.": RETURN
26200 IF LEFT$(A$, 2) = "t " THEN PRINT "You get no response.": RETURN
26220 IF LEFT$(A$, 2) = "o " THEN PRINT "You can't open that.": RETURN
26240 IF LEFT$(A$, 2) = "c " THEN PRINT "You can't close that.": RETURN
26260 IF LEFT$(A$, 2) = "k " THEN PRINT "You can't kill that.": RETURN
26280 IF MV = 1 THEN PRINT "You can't go that way.": RETURN
26300 PRINT "You can't do that.": RETURN
27000 'drop subroutine
27010 IF A$ = "d bulb" THEN IF OBJ$(15) = "a lightbulb.  " THEN RETURN
27999 RETURN
35000 PRINT : PRINT "Alas, bold and valiant adventurer, here ends your quest.  Would you like to giveit another try?": INPUT "> ", A$: PRINT
35010 IF A$ = "yes" OR A$ = "y" OR A$ = "Y" OR A$ = "YES" THEN PRINT "Press any key to begin...": A$ = INPUT$(1): RUN
35020 IF A$ = "no" OR A$ = "n" THEN PRINT "Press any key to exit...": A$ = INPUT$(1): END
35030 PRINT "A simple yes or no answer will be fine.": INPUT "> ", A$: PRINT : GOTO 35010
40000 IF LEFT$(A$, 2) = "k " THEN RANDOMIZE TIMER: PLAYR = INT(RND * 10) + 1 ELSE PLAYR = 0
40001 IF PLAYR = 0 THEN GOTO 40010
40002 IF PLAYR > 6 THEN PRINT "You swing at the foul troll, but miss.": GOTO 40010
40003 IF WIELD$ = "" THEN PRINT "You land a quick punch to the troll's face.": TROLL = TROLL - 2
40004 IF WIELD$ = "A mace.  " THEN PRINT "You bring the mace crashing down upon the troll's head.": TROLL = TROLL - 4
40008 IF TROLL < 1 THEN PRINT "The troll drops to the ground in a heap and vanishes in a brilliant flash of    color, leaving its weapon behind.": TROL = 1: BOB = 1: RETURN
40010 RANDOMIZE TIMER: TROLA = INT(RND * 10) + 1
40011 IF TROLA > 6 THEN PRINT "The troll lashes out at you, but misses.": GOTO 40019
40012 IF TROLA = 1 THEN PRINT "The troll takes a swing at you with its axe.  Ow!": PHP = PHP - 7: GOTO 40019
40013 IF TROLA = 6 THEN PRINT "The troll's claws just barely scratched your arm.": PHP = PHP - 1: GOTO 40019
40014 PRINT "The troll swipes at you with its claws.  Ouch!": PHP = PHP - 4
40015 IF PHP < 1 THEN PRINT "Ow!  Ow!  You're dead!  Ouch!  Oh, agony!": GOTO 35000
40019 RETURN
41000 IF LEFT$(A$, 2) = "k " THEN RANDOMIZE TIMER: PLAYR = INT(RND * 10) + 1 ELSE PLAYR = 0
41001 IF PLAYR = 0 THEN GOTO 41010
41002 IF PLAYR > 5 THEN PRINT "You take a swing at the bandit, but miss.": GOTO 41010
41003 IF WIELD$ = "" THEN PRINT "You deal the bandit a quick blow to the stomach.": BANDI = BANDI - 2
41004 IF WIELD$ = "A mace.  " THEN PRINT "You brain the bandit with the mace.": BANDI = BANDI - 4
41005 IF WIELD$ = "An axe.  " THEN PRINT "The bandit's blood spills from a large axe-wound.": BANDI = BANDI - 5
41007 IF WIELD$ = "A knife.  " THEN PRINT "You drive the rusty knife into the bandit.": BANDI = BANDI - 3
41008 IF BANDI < 1 THEN PRINT "The bandit drop to his knees, defeated.  He smiles at you, then turns his eyes  eastward as he slowly fades out of sight.": BANDITO = 1: RETURN
41010 RANDOMIZE TIMER: BANDI = INT(RND * 10) + 1
41011 IF BANDI > 5 THEN PRINT "The bandit swings at you, but misses.": GOTO 41019
41012 IF BANDI = 1 THEN PRINT "The bandit leaps into the air and delivers a powerful kick to your head.  Oof!": PHP = PHP - 9: GOTO 41019
41013 IF BANDI = 5 THEN PRINT "The bandit gives you a glancing blow to the head.": PHP = PHP - 1: GOTO 41019
41014 PRINT "The bandit assails you with a flurry of lightning fast punches.": PHP = PHP - 5
41015 IF PHP < 1 THEN PRINT "Ow!  Ow!  You're dead!  Ouch!  Oh, agony!": GOTO 35000
41019 RETURN
42000 IF LEFT$(A$, 2) = "k " THEN RANDOMIZE TIMER: PLAYR = INT(RND * 10) + 1 ELSE PLAYR = 0
42001 IF PLAYR = 0 THEN GOTO 42010
42002 IF PLAYR > 8 THEN PRINT "You swing at the evil dragon, but miss.": GOTO 42010
42003 IF WIELD$ = "" OR WIELD$ = "a mace.  " OR WIELD$ = "An axe.  " OR WIELD$ = "A knife.  " THEN PRINT "Your puny attack bounces harmlessly off the dragon's thick, scaly hide.": sleepvar = 0
42006 IF WIELD$ = "A sword.  " THEN PRINT "A trickle of green blood oozes from a tiny cut in the dragon's hide.": DRAGON = DRAGON - 1
42008 IF DRAGON < 1 THEN PRINT "The dragon finally collapses and comes crashing to the ground...right on top of you.  Needless to say, you are squashed quite flat, quite quickly.": GOTO 35000
42010 RANDOMIZE TIMER: DRAGO = INT(RND * 20) + 1
42011 IF DRAGO = 1 AND sleepvar < 3 THEN PRINT "The dragon is forced to stifle a yawn.": GOTO 40019 ELSE IF sleepvar > 4 THEN PRINT "The dragon stretches, yawns, and goes back to sleep.": DRAGON = 0: GOTO 42019
42012 IF DRAGO < 6 THEN PRINT "The dragon breathes a searing blast of flame in your direction.  Yow!": PHP = PHP - 8: GOTO 42019
42013 IF DRAGO < 7 THEN PRINT "The dragon nails you with an enormous fireball.": PHP = PHP - 15: GOTO 42019
42014 IF DRAGO < 9 THEN PRINT "The dragon snaps at you with its fearsome jaws.  Ouch!": PHP = PHP - 5: GOTO 42019
42015 IF DRAGO < 11 THEN PRINT "The dragon swipes at you with its claws.  Ow!": PHP = PHP - 3: GOTO 42019
42016 PRINT "The dragon lashes out at you, but misses."
42017 IF PHP < 1 THEN PRINT "That last attack was just too much for you.": GOTO 35000
42019 RETURN
43000 IF LEFT$(A$, 2) = "k " THEN RANDOMIZE TIMER: PLAYR = INT(RND * 10) + 1 ELSE PLAYR = 0
43001 IF PLAYR = 0 THEN GOTO 40010
43002 IF PLAYR > 6 THEN PRINT "You swing at the big ogre, but miss.": GOTO 40010
43003 IF WIELD$ = "" OR A$ = "A mace.  " THEN PRINT "The ogre simply shrugs off your pounding.": GOTO 40010
43005 'THEN PRINT"You hit the ogre, barely hurting him at all.":MONST=MONST-2
43008 IF MONST < 1 THEN PRINT "That last blow was just what it took to make the ogre REALLY mad!  He doesn't   try very hard to hide his feelings, either...": GOTO 35000
43010 RANDOMIZE TIMER: MNSTR = INT(RND * 10) + 1
43011 IF MNSTR > 4 THEN PRINT "The ogre swings at you, but misses.": GOTO 40019
43012 IF MNSTR = 1 THEN PRINT "Ow!  The ogre really nailed you that time.": PHP = PHP - 12: GOTO 40019
43013 IF MNSTR = 4 THEN PRINT "The ogre hits you with a brush to the side of the head.": PHP = PHP - 1: GOTO 40019
'43014 IF THEN PRINT"The ogre puches you in the head.":PHP=PHP-6
43015 IF PHP < 1 THEN PRINT "Your head teeters precariously atop your neck for a moment, and rolls off onto  the floor with a sickening thud that only the ogre hears.": GOTO 35000
43019 RETURN
50000 IF A$ = "wield axe" AND WIELD$ = "An axe.  " OR A$ = "wield mace" AND WIELD$ = "A mace.  " OR A$ = "wield sword" AND WIELD$ = "A sword.  " OR A$ = "wield knife" AND WIELD$ = "A knife." THEN PRINT "You're already wielding it.": RETURN
50001 IF A$ <> "wield axe" AND A$ <> "wield knife" AND A$ <> "wield sword" AND A$ <> "wield mace" THEN PRINT "You can't wield that.": RETURN
50002 IF A$ = "wield mace" AND OBJ$(1) <> "" THEN GOTO 50010
50003 IF A$ = "wield axe" AND OBJ$(2) <> "" THEN GOTO 50020
50004 IF A$ = "wield sword" AND OBJ$(3) <> "" THEN GOTO 50030
50005 IF A$ = "wield knife" AND OBJ$(4) <> "" THEN GOTO 50040
50010 IF WIELD$ = "An axe.  " THEN SWAP WIELD$, OBJ$(2): SWAP WIELD$, OBJ$(1)
50011 IF WIELD$ = "A sword.  " THEN SWAP WIELD$, OBJ$(3): SWAP WIELD$, OBJ$(1)
50012 IF WIELD$ = "A knife.  " THEN SWAP WIELD$, OBJ$(4): SWAP WIELD$, OBJ$(1)
50013 IF WIELD$ = "" THEN SWAP WIELD$, OBJ$(1)
50014 IF WIELD$ = "A mace.  " THEN PRINT "You wield the mace.": RETURN
50020 IF WIELD$ = "A mace.  " THEN SWAP WIELD$, OBJ$(1): SWAP WIELD$, OBJ$(2)
50021 IF WIELD$ = "A sword.  " THEN SWAP WIELD$, OBJ$(3): SWAP WIELD$, OBJ$(2)
50022 IF WIELD$ = "A knife.  " THEN SWAP WIELD$, OBJ$(4): SWAP WIELD$, OBJ$(2)
50023 IF WIELD$ = "" THEN SWAP WIELD$, OBJ$(2)
50024 IF WIELD$ = "An axe.  " THEN PRINT "You wield the axe.": RETURN
50030 IF WIELD$ = "A mace.  " THEN SWAP WIELD$, OBJ$(1): SWAP WIELD$, OBJ$(3)
50031 IF WIELD$ = "An axe.  " THEN SWAP WIELD$, OBJ$(2): SWAP WIELD$, OBJ$(3)
50032 IF WIELD$ = "A knife.  " THEN SWAP WIELD$, OBJ$(4): SWAP WIELD$, OBJ$(3)
50033 IF WIELD$ = "" THEN SWAP WIELD$, OBJ$(3)
50034 IF WIELD$ = "A sword.  " THEN PRINT "You wield the sword.": RETURN
50040 IF WIELD$ = "A mace.  " THEN SWAP WIELD$, OBJ$(1): SWAP WIELD$, OBJ$(4)
50041 IF WIELD$ = "An axe.  " THEN SWAP WIELD$, OBJ$(2): SWAP WIELD$, OBJ$(4)
50042 IF WIELD$ = "A sword.  " THEN SWAP WIELD$, OBJ$(3): SWAP WIELD$, OBJ$(4)
50043 IF WIELD$ = "" THEN SWAP WIELD$, OBJ$(4)
50044 IF WIELD$ = "A knife.  " THEN PRINT "You wield the knife.": RETURN
50045 PRINT "You can't wield that.": RETURN
51000 PRINT "You are ";
51001 IF PHP = 30 THEN PRINT "in perfect shape."
51002 IF PHP < 30 AND PHP > 24 THEN PRINT "in good shape."
51003 IF PHP < 25 AND PHP > 19 THEN PRINT "in fairly good shape."
51004 IF PHP < 20 AND PHP > 14 THEN PRINT "in acceptable shape."
51005 IF PHP < 15 AND PHP > 9 THEN PRINT "bad shape."
51006 IF PHP < 10 AND PHP > 4 THEN PRINT "poor shape."
51007 IF PHP = 1 THEN PRINT "a goner."
51008 RETURN
56000 CLS : PRINT "Help"
56010 PRINT "Commands commonly used:"
56020 PRINT "TAKE OR GET   LOOK (L)   N,S,E,W,U,D   OPEN   READ   WAVE   CLOSE   FLIP        WIELD   INVENTORY (I)   EXAMINE (X)": PRINT
56025 A$ = "l"
56030 RETURN

