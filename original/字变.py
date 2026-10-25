# +-------------+
# | POV nametag |
# +-------------+
# Version 1.0: 03JUN-09JUN2022 by Mc_Fly
# 
# https://www.printables.com/model/222438-pov-nametag

import math

# Change it if you want the platform thin o thick
platform_thick=10

# Space between letters
space=10

# These letters cannot be splitted
do_not_split='&/2345679CDEFGKPSQ'


# Font style. Do not change it
font = '"Tahoma:style=Regular"'

# Font size. Do not change it
fontsize=100

# Cube that splits the letter uses it. Not necessary to change it
tolerance=1

# Used during development. Shows the difference cubes and reference points
debug=0


# Copy & paste from metrics.scad if you changed metrics or added a letter
# After pasting, replace // by #

# Letter width. Position is character ASCII starting at zero
letter_width=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
91.6, # 38 - &
0,0,0,0,0,0,0,0,
42.4, # 47 - /
63.4, # 48 - 0
49.3, # 49 - 1
61.1, # 50 - 2
60.2, # 51 - 3
69.7, # 52 - 4
60.2, # 53 - 5
64.3, # 54 - 6
64.2, # 55 - 7
64.4, # 56 - 8
64.3, # 57 - 9
0,0,0,0,0,0,0,
84.7, # 65 - A
68.5, # 66 - B
75,   # 67 - C
79.6, # 68 - D
63.2, # 69 - E
60.4, # 70 - F
79.9, # 71 - G
73.3, # 72 - H
39.2, # 73 - I
47.7, # 74 - J
73.5, # 75 - K
58.5, # 76 - L
86.5, # 77 - M
72.2, # 78 - N
87.4, # 79 - O
63.7, # 80 - P
70.9, # 81 - Q
78.2, # 82 - R
67.3, # 83 - S
81.2, # 84 - T
73.1, # 85 - U
83.9, # 86 - V
121.8,# 86 - W
79.5, # 87 - X
81.7, # 88 - Y
70.6  # 89 - Z
];

# Bearing X
letter_bearingx=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
-4.4,  # 38 - &
0,0,0,0,0,0,0,0,
-4.9,  # 47 - /
-5.4,  # 48 - 0
-15.3, # 49 - 1
-7.2,  # 50 - 2
-6.4,  # 51 - 3
-2.7,  # 52 - 4
-8.4,  # 53 - 5
-5.6,  # 54 - 6
-6.7,  # 55 - 7
-4.9,  # 56 - 8
-4.4,  # 57 - 9
0,0,0,0,0,0,0,
0.7,   # 65 - A
-10.3, # 66 - B
-4.5,  # 67 - C
-10.3, # 68 - D
-10.3, # 69 - E
-10.3, # 70 - F
-4.5,  # 71 - G
-10.3, # 72 - H
-6.3,  # 73 - I
-0.6,  # 74 - J
-10.3, # 75 - K
-10.3, # 76 - L
-10.3, # 77 - M
-10.3, # 78 - N
-4.5,  # 79 - O
-10.3, # 80 - P
-3.5,  # 81 - Q
-10.3, # 82 - R
-5.2,  # 83 - S
0,     # 84 - T
-9,    # 85 - U
0.5,   # 86 - V
-1.7,  # 87 - W
-0.5,  # 88 - X
0.8,   # 89 - Y
-4     # 90 - Z
];

# Scale
letter_scale=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
0.98, # 38 - &
1,1,1,1,1,1,1,1,
0.957,# 47 - /
0.98, # 48 - 0
1,    # 49 - 1
0.98, # 50 - 2
0.98, # 51 - 3
1,    # 52 - 4
1,    # 53 - 5
0.98, # 54 - 6
1,    # 55 - 7
0.978,# 56 - 8
0.98, # 57 - 9
1,1,1,1,1,1,1,
1,    # 65 - A
1,    # 66 - B
0.98, # 67 - C
1,    # 68 - D
1,    # 69 - E
1,    # 70 - F
0.98, # 71 - G
1,    # 72 - H
1,    # 73 - I
1,    # 74 - J
1,    # 75 - K
1,    # 76 - L
1,    # 77 - M
1,    # 78 - N
0.98, # 79 - O
1,    # 80 - P
0.79, # 81 - Q
1,    # 82 - R
0.98, # 83 - S
1,    # 84 - T
1,    # 85 - U
1,    # 86 - V
1,    # 87 - W
1,    # 88 - X
1,    # 89 - Y
1     # 90 - Z
];

# Lift distance. If not, letter Q shows like O
letter_lift=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,    # 38 - &
0,0,0,0,0,0,0,0,
0,    # 47 - /
0,    # 48 - 0
0,    # 49 - 1
0,    # 50 - 2
0,    # 51 - 3
0,    # 52 - 4
0,    # 53 - 5
0,    # 54 - 6
0,    # 55 - 7
0,    # 56 - 8
0,    # 57 - 9
0,0,0,0,0,0,0,
0,    # 65 - A
0,    # 66 - B
0,    # 67 - C
0,    # 68 - D
0,    # 69 - E
0,    # 70 - F
0,    # 71 - G
0,    # 72 - H
0,    # 73 - I
0,    # 74 - J
0,    # 75 - K
0,    # 76 - L
0,    # 77 - M
0,    # 78 - N
0,    # 79 - O
0,    # 80 - P
19.5, # 81 - Q
0,    # 82 - R
0,    # 83 - S
0,    # 84 - T
0,    # 85 - U
0,    # 86 - V
0,    # 86 - W
0,    # 87 - X
0,    # 88 - Y
0     # 89 - Z
];

### Here finish the paste from metrics.scad  ###

string1 = input('Enter string 1: ')
if string1=='':
    print('Nothing to do')
    exit()

string2 = input('Enter string 2: ')
if string2=='':
    print('Nothing to do')
    exit()

string1=string1.upper()
string2=string2.upper()

ssplit1=''
for i in range(0,len(string1)): ssplit1=ssplit1+'0'

ssplit2=''
for i in range(0,len(string2)): ssplit2=ssplit2+'0'

while len(string1)>len(string2):

    # Split the wider character
    wider=0
    for i in range(0,len(string2)):
        w=letter_width[ord(string2[i])]
        if w>wider and ssplit2[i]=='0' and string2[i] not in do_not_split: # and string1[i] not in do_not_split:
            wider=w
            wideri=i
    if wider==0:
        print('Cannot split more... change one word and try again')
        exit()
    
    string2=string2[0:wideri]+string2[wideri]+string2[wideri:len(string2)]
    ssplit2=ssplit2[0:wideri]+'12'+ssplit2[wideri+1:len(ssplit2)]

while len(string2)>len(string1):

    # Split the wider character
    wider=0
    for i in range(0,len(string1)):
        w=letter_width[ord(string1[i])]
        if w>wider and ssplit1[i]=='0' and string1[i] not in do_not_split: # and string2[i] not in do_not_split:
            wider=w
            wideri=i
    if wider==0:
        print('Cannot split more... change one word and try again')
        exit()
    
    string1=string1[0:wideri]+string1[wideri]+string1[wideri:len(string1)]
    ssplit1=ssplit1[0:wideri]+'12'+ssplit1[wideri+1:len(ssplit1)]

# Create .scad file
f = open('POVnametag.scad', 'w')
f.write('// Script generated using POVnametag.py\n')
f.write('// https://www.printables.com/model/222438-pov-nametag\n')
f.write('\n')
f.write('$fn=64;\n')
f.write('\n')

x1, y1, z1, x2, y2, z2 = 0,0,0,0,0,0

for i in range(0, len(string1)):
    
    if not debug: f.write('intersection() {\n')
    margin1=letter_bearingx[ord(string1[i])]
    margin2=letter_bearingx[ord(string2[i])]
    
    scale1=letter_scale[ord(string1[i])]
    scale2=letter_scale[ord(string2[i])]

    lift1=letter_lift[ord(string1[i])]
    lift2=letter_lift[ord(string2[i])]

    ex1=letter_width[ord(string1[i])]
    ex2=letter_width[ord(string2[i])]

    split1=ssplit1[i]
    split2=ssplit2[i]

    tab='\t'
    if debug: tab=''

    # Letter 1
    if split1!='0' and not debug:
        f.write('\tdifference() {\n')
        tab='\t\t'

    f.write(tab+'rotate([90,0,0])\n')
    f.write(tab+'translate(['+str(x1+margin1)+','+str(y1+lift1)+','+str(z1-ex2)+'])\n')
    if scale1!=1: f.write(tab+'scale(['+str(scale1)+','+str(scale1)+',1])\n')
    f.write(tab+'linear_extrude('+str(ex2)+') {\n')
    f.write(tab+'\ttext("'+string1[i]+'", size = '+str(fontsize)+', font = '+font+', halign = "left", valign = "baseline");\n')
    f.write(tab+'}\n')

    if split1=='1':
        if debug: f.write(tab+'color("red")\n')
        f.write(tab+'translate(['+str(x1+ex1/2)+','+str((z1+tolerance)*-1)+',0])\n')
        f.write(tab+'cube(['+str(tolerance+ex1/2)+','+str(ex2+tolerance*2)+','+str(fontsize+10)+']);\n')
        if not debug: f.write('\t}\n')

    if split1=='2':
        if debug: f.write(tab+'color("red")\n')
        f.write(tab+'translate(['+str(x1-tolerance)+','+str((z1+tolerance)*-1)+',0])\n')
        f.write(tab+'cube(['+str(tolerance+ex1/2)+','+str(ex2+tolerance*2)+','+str(fontsize+10)+']);\n')
        if not debug: f.write('\t}\n')

    f.write('\n')

    # Letter 2
    if split2!='0' and not debug:
        f.write('\tdifference() {\n')
        tab='\t\t'
    
    f.write(tab+'rotate([90,0,90])\n')
    f.write(tab+'translate(['+str(x2+margin2)+','+str(y2+lift2)+','+str(z2)+'])\n')
    if scale2!=1: f.write(tab+'scale(['+str(scale2)+','+str(scale2)+',1])\n')
    f.write(tab+'linear_extrude('+str(ex1)+') {\n')
    f.write(tab+'\ttext("'+string2[i]+'", size = '+str(fontsize)+', font = '+font+', halign = "left", valign = "baseline");\n')
    f.write(tab+'}\n')
    
    if split2=='1':
        if debug: f.write(tab+'color("red")\n')
        f.write(tab+'translate(['+str(z2-tolerance)+','+str(x2+ex2/2)+',0])\n')
        f.write(tab+'cube(['+str(ex1+tolerance*2)+','+str(tolerance+ex2/2)+','+str(fontsize+10)+']);\n')
        if not debug: f.write('\t}\n')

    if split2=='2':
        if debug: f.write(tab+'color("red")\n')
        f.write(tab+'translate(['+str(z2-tolerance)+','+str(x2-tolerance)+',0])\n')
        f.write(tab+'cube(['+str(ex1+tolerance*2)+','+str(tolerance+ex2/2)+','+str(fontsize+10)+']);\n')
        if not debug: f.write('\t}\n')

    if not debug: f.write('}\n')
    f.write('\n')

    if split1!='1': z2=z2+ex1+space
    if split2!='1': z1=z1-ex2-space
    
    if split1!='1': x1=x1+letter_width[ord(string1[i])]+space
    if split2!='1': x2=x2+letter_width[ord(string2[i])]+space

# Calculate the central platform line
x1, y1, x2, y2, sx, sy, sxy, sx2 = 0,0,0,0,0,0,0,0
downpoint=[]
uppoint=[]
for i in range(0, len(string1)):

    if debug:
        f.write('color("blue")\n')
        f.write('translate(['+str(x2)+','+str(y2)+',110])\n')
        f.write('sphere(2);\n')

    split1=ssplit1[i]
    split2=ssplit2[i]

    ex1=letter_width[ord(string1[i])]
    ex2=letter_width[ord(string2[i])]

    x1=x2+ex1
    y1=y2+ex2

    if split2=='1': y1=y1-(ex2/2)
    if split2=='2': y1=y1-(ex2/2)
    if split1=='1': x1=x1-(ex1/2)
    if split1=='2': x1=x1-(ex1/2)

    xm=(x1-x2)/2
    ym=(y1-y2)/2
    lastx=x1
    lasty=y1
    
    if debug:
        f.write('color("red")\n')
        f.write('translate(['+str(x1)+','+str(y1)+',110])\n')
        f.write('sphere(2);\n')
        f.write('color("green")\n')
        f.write('translate(['+str(x2+xm)+','+str(y2+ym)+',110])\n')
        f.write('sphere(2);\n')

        f.write('color("yellow")\n')
        f.write('translate(['+str(x1)+','+str(y1-ex2)+',110])\n')
        f.write('sphere(2);\n')
    
    downpoint.append([x1,y1-ex2])

    if debug:
        f.write('color("pink")\n')
        f.write('translate(['+str(x2)+','+str(y1)+',110])\n')
        f.write('sphere(2);\n')
    
    uppoint.append([x2,y1])

    sx=sx+x2+xm
    sy=sy+y2+ym
    sxy=sxy+((x2+xm)*(y2+ym))
    sx2=sx2+((x2+xm)**2)

    if split1!='1': x2=x2+ex1+space
    if split2!='1': y2=y2+ex2+space
    
    if split2=='1': y2=y2+(ex2/2)
    if split2=='2': y2=y2-(ex2/2)
    if split1=='1': x2=x2+(ex1/2)
    if split1=='2': x2=x2-(ex1/2)


n=len(string1)

if n==1:
    m=1
else:
    m=(sxy-((sx*sy)/n))/(sx2-(sx**2/n))

#mx=sx/n
#my=sy/n
#b=my-(m*mx)

lineangle=math.atan(m)

# Search lowest point
pmax=0
for i in downpoint:
    dist=i[0]-(i[1]/math.tan(lineangle))
    if dist>pmax:
        pmax=dist
        maxx=i[0]
        maxy=i[1]

if debug:
    f.write('color("purple")\n')
    f.write('translate(['+str(maxx)+','+str(maxy)+',110])\n')
    f.write('sphere(3);\n')

# Search highest point
pmin=999999999999
for i in uppoint:
    dist=i[0]-(i[1]/math.tan(lineangle))
    if dist<pmin:
        pmin=dist
        minx=i[0]
        miny=i[1]

if debug:
    f.write('color("orange")\n')
    f.write('translate(['+str(minx)+','+str(miny)+',110])\n')
    f.write('sphere(3);\n')

# Search lowest parallel line.  It has same m (y=m.x+p)
plow=maxy-(m*maxx)

# Search highest parallel line. It has same m (y=m.x+p)
phigh=miny-(m*minx)

# Search left perpendicular line (m1*m2=-1)
m2=-1/m
pleft=0 # because through 0,0

# Search right perpendicular line (m1*m2=-1)
pright=lasty-(m2*lastx)

# Search four intersection points
# y = m *x + plow
# y = m *x + phigh
# y = m2*x + pleft
# y = m2*x + pright
i1x=(plow-pleft)/(m2-m)
i1y=(m*i1x)+plow

if debug:
    f.write('color("orange")\n')
    f.write('translate(['+str(i1x)+','+str(i1y)+',110])\n')
    f.write('sphere(3);\n')

i2x=(phigh-pleft)/(m2-m)
i2y=(m*i2x)+phigh

if debug:
    f.write('color("black")\n')
    f.write('translate(['+str(i2x)+','+str(i2y)+',110])\n')
    f.write('sphere(3);\n')

i3x=(plow-pright)/(m2-m)
i3y=(m*i3x)+plow

if debug:
    f.write('color("pink")\n')
    f.write('translate(['+str(i3x)+','+str(i3y)+',110])\n')
    f.write('sphere(3);\n')

i4x=(phigh-pright)/(m2-m)
i4y=(m*i4x)+phigh

if debug:
    f.write('color("cyan")\n')
    f.write('translate(['+str(i4x)+','+str(i4y)+',110])\n')
    f.write('sphere(3);\n')

# Finally, draw the platform
f.write('// Platform\n')
f.write('translate([0,0,-'+str(platform_thick)+'])\n')
f.write('linear_extrude(height='+str(platform_thick)+') {\n')
f.write('\tpolygon(points=[['+str(i1x)+','+str(i1y)+'],['+str(i3x)+','+str(i3y)+'],['+str(i4x)+','+str(i4y)+'],['+str(i2x)+','+str(i2y)+']]);\n')
f.write('}')
f.close()