adapt-pageMenuRouter
================

Routing to pages and menus for various devices, buttons and configurations

Routes can be specified in three formats:
```
#/id/co-20   <- by url anchor




or

co-20	<- by element id



i.e.

#/    <- will go to the initial page


  
or  
  
  
  
@bank 1  <- will go to the next bank  
  
  
```

Devices can be selected using the following names:
```
small
medium
large
extralarge
notouch
touch

"small medium notouch"   <-- would select all small sized screen that aren't touchscreens

"small medium"	<-- would select all small touch and nontouch devices

"small medium touch"	<-- would select all small touch devices

```

Routes are applied to:
```
"_pages": [

]

"_menus": [

]

"_articles": [

]

"_blocks": [

]

"_components": [

]

whose models match the objects contain in each array.


i.e.

"_pages": [
    {
        "_type": "page"
    }
]

would match all pages

and

"_components": [
    {
        "_id": "c-20"
    },
    {
        "_id": "c-21"
    }
]

would match component c-20 and c-21

```

Example Configuration (add to course.json):
```
    "_pageMenuRouter": {
        "_hideBackButton": {
            "_pages": [
                {
                    "_id": "co-05"
                }
            ]
        },
        "_events": {
            "adapt:initialize large extralarge": "co-20",
            "adapt:initialize small medium touch": "co-25",
            "adapt:initialize small medium notouch": "co-25"
        },
        "_selectors": [
            {
                "_menus": [
                    {
                        "_id": "co-10"
                    }
                ],
                "_selector": "a.menu-back-button", 
                "_events": {
                    "click small medium large extralarge": "co-20"
                }
            }
        ],
        "_selectors": [
             { 
                "_components": [ 
                    { "_type": "component" }
                ], 
                "_selector": ".icon-beaker a", 
                "_events": { 
                    "click small medium large extralarge": "@block 1" 
                },
                "_ignoreComponents" : [
                    "blank"
                ]
            }
        ],
        "_buttons": [
            {
                "_components": [
                    {
                        "_id": "c-20"
                    }
                ],
                "text": "Click me to go to co-40 for desktop and co35 for mobile",
                "_dom": "#test",  
                "_events": {
                    "click large extralarge": "co-40",
                    "click small medium": "co-35"
                }
            }
        ],
        "_topnavigations": [
            {
                "_pages": [
                    {
                        "_id": "co-20"
                    }
                ],
                "text": "",
                "_dom": ".icon.icon-popup",
                "_events": {
                    "click large extralarge": "#/",
                    "click small medium": "co-70"
                }
            }
        ]
    }
```

To hide the back button globally:
```
    "_pageMenuRouter": {
        "_hideBackButton": {
            "_pages": [
                {
                    "_type": "page"
                }
            ],
            "_menus": [
                {
                    "_type": "menu"
                }
            ]
        }
    }
```

To change application start/intro page:
```
    "_pageMenuRouter": {
        "_events": {
            "adapt:initialize large extralarge": "co-20",
            "adapt:initialize small medium": "co-25"
        }
    }
```

To change menu item behaviour:
```
    "_pageMenuRouter": {
        "_selectors": [
            {
                "_menus": [
                    {
                        "_id": "co-10"
                    }
                ],
                "_selector": "a.menu-back-button", 
                "_events": {
                    "click small medium large extralarge": "co-20"
                }
            }
        ]
    }
```

To add a button to a component:
```
    "_pageMenuRouter": {
        "_buttons": [
            {
                "_components": [
                    {
                        "_id": "c-20"
                    }
                ],
                "text": "Click me to go to co-40 for desktop and co35 for mobile",
                "_dom": "#test",  
                "_events": {
                    "click large extralarge": "co-40",
                    "click small medium": "co-35"
                }
            }
        ]
    }
```
  
To force a series of component element clicks to move to the next block on the page, skipping blocks containing only blank components:
```
"_selectors": [
     { 
        "_components": [ 
            { "_type": "component" }
        ], 
        "_selector": ".icon-beaker a", 
        "_events": { 
            "click small medium large extralarge": "@block 1" 
        },
        "_ignoreComponents" : [
            "blank"
        ]
    }
]
```

Use the _dom item to add attributes or classes to your buttons or topnavigation buttons:
```

"_dom": ".newClass.newClass2#newId[newAttribute='newAttributeValue']"


```
See [Emmet.io Cheatsheet](http://docs.emmet.io/cheat-sheet/)

To add a top navigation button to a single page:
```
    "_pageMenuRouter": {
        "_topnavigations": [
            {
                "_pages": [
                    {
                        "_id": "co-20"
                    }
                ],
                "text": "",
                "_dom": ".icon.icon-popup",
                "_events": {
                    "click large extralarge": "#/",
                    "click small medium": "co-70"
                }
            }
        ]
    }
```

To add a top navigation button to all pages and menus:
```
    "_pageMenuRouter": {
        "_topnavigations": [
            {
                "_pages": [
                    {
                        "_type": "page"
                    }
                ],
                "_menus": [
                    {
                        "_type": "menu"
                    }
                ],
                "text": "",
                "_dom": ".icon.icon-popup",
                "_events": {
                    "click large extralarge": "#/",
                    "click small medium": "co-70"
                }
            }
        ]
    }
```