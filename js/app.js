data = {
    "class": "go.TreeModel",
    "nodeDataArray": [
        {
            "key": 1,
            "name": "Stella Payne Diaz",
            "title": "CEO",
            "pic": "1.jpg"
        },
        {
            "key": 2,
            "name": "Luke Warm",
            "title": "VP Marketing/Sales",
            "pic": "2.jpg",
            "parent": 1
        },
        {
            "key": 3,
            "name": "Meg Meehan Hoffa",
            "title": "Sales",
            "pic": "3.jpg",
            "parent": 2
        },
        {
            "key": 4,
            "name": "Peggy Flaming",
            "title": "VP Engineering",
            "pic": "4.jpg",
            "parent": 1
        },
        {
            "key": 5,
            "name": "Saul Wellingood",
            "title": "Manufacturing",
            "pic": "5.jpg",
            "parent": 4
        },
        {
            "key": 6,
            "name": "Al Ligori",
            "title": "Marketing",
            "pic": "6.jpg",
            "parent": 2
        },
        {
            "key": 7,
            "name": "Dot Stubadd",
            "title": "Sales Rep",
            "pic": "7.jpg",
            "parent": 3
        },
        {
            "key": 8,
            "name": "Les Ismore",
            "title": "Project Mgr",
            "pic": "8.jpg",
            "parent": 5
        },
        {
            "key": 9,
            "name": "April Lynn Parris",
            "title": "Events Mgr",
            "pic": "9.jpg",
            "parent": 6
        },
        {
            "key": 10,
            "name": "Xavier Breath",
            "title": "Engineering",
            "pic": "10.jpg",
            "parent": 4
        },
        {
            "key": 11,
            "name": "Anita Hammer",
            "title": "Process",
            "pic": "11.jpg",
            "parent": 5
        },
        {
            "key": 12,
            "name": "Billy Aiken",
            "title": "Software",
            "pic": "12.jpg",
            "parent": 10
        },
        {
            "key": 13,
            "name": "Stan Wellback",
            "title": "Testing",
            "pic": "13.jpg",
            "parent": 10
        },
        {
            "key": 14,
            "name": "Marge Innovera",
            "title": "Hardware",
            "pic": "14.jpg",
            "parent": 10
        },
        {
            "key": 15,
            "name": "Evan Elpus",
            "title": "Quality",
            "pic": "15.jpg",
            "parent": 5
        },
        {
            "key": 16,
            "name": "Lotta B. Essen",
            "title": "Sales Rep",
            "pic": "16.jpg",
            "parent": 3
        }
    ]
}

function init() {

const $ = go.GraphObject.make;

myDiagram =
  new go.Diagram("myDiagramDiv", // must be the ID or reference to div
    {
      allowCopy: false,
      allowDelete: false,
      //initialAutoScale: go.Diagram.Uniform,
      maxSelectionCount: 1, // users can select only one part at a time
      validCycle: go.Diagram.CycleDestinationTree, // make sure users can only create trees
      "clickCreatingTool.archetypeNodeData": { // allow double-click in background to create a new node
        name: "(کاربر جدید)",
        title: "",
        comments: ""
      },
      "clickCreatingTool.insertPart": function(loc) {  // method override must be function, not =>
        const node = go.ClickCreatingTool.prototype.insertPart.call(this, loc);
        if (node !== null) {
          this.diagram.select(node);
          this.diagram.commandHandler.scrollToPart(node);
          this.diagram.commandHandler.editTextBlock(node.findObject("NAMETB"));
        }
        return node;
      },
      layout:
        $(go.TreeLayout,
          {
            treeStyle: go.TreeLayout.StyleLastParents,
            arrangement: go.TreeLayout.ArrangementHorizontal,
            // properties for most of the tree:
            angle: 90,
            layerSpacing: 35,
            // properties for the "last parents":
            alternateAngle: 90,
            alternateLayerSpacing: 35,
            alternateAlignment: go.TreeLayout.AlignmentBus,
            alternateNodeSpacing: 20
          }),
      "undoManager.isEnabled": true // enable undo & redo
    });

// when the document is modified, add a "*" to the title and enable the "Save" button
myDiagram.addDiagramListener("Modified", e => {
  const button = document.getElementById("SaveButton");
  if (button) button.disabled = !myDiagram.isModified;
  const idx = document.title.indexOf("*");
  if (myDiagram.isModified) {
    if (idx < 0) document.title += "*";
  } else {
    if (idx >= 0) document.title = document.title.slice(0, idx);
  }
});

const levelColors = ["#AC193D", "#2672EC", "#8C0095", "#5133AB",
  "#040505", "#D24726", "#008A00", "#094AB2"];

// override TreeLayout.commitNodes to also modify the background brush based on the tree depth level
myDiagram.layout.commitNodes = function() {  // method override must be function, not =>
  go.TreeLayout.prototype.commitNodes.call(this);  // do the standard behavior
  // then go through all of the vertexes and set their corresponding node's Shape.fill
  // to a brush dependent on the TreeVertex.level value
  myDiagram.layout.network.vertexes.each(v => {
    if (v.node) {
      const level = v.level % (levelColors.length);
      const color = levelColors[level];
      const shape = v.node.findObject("SHAPE");
      if (shape) shape.stroke = $(go.Brush, "Linear", { 0: color, 1: go.Brush.lightenBy(color, 0.05), start: go.Spot.Left, end: go.Spot.Right });
    }
  });
};

// this is used to determine feedback during drags
function mayWorkFor(node1, node2) {
  if (!(node1 instanceof go.Node)) return false;  // must be a Node
  if (node1 === node2) return false;  // cannot work for yourself
  if (node2.isInTreeOf(node1)) return false;  // cannot work for someone who works for you
  return true;
}

// This function provides a common style for most of the TextBlocks.
// Some of these values may be overridden in a particular TextBlock.
function textStyle() {
  return { font: "9pt  IRANSansX", stroke: "white" };
}

// This converter is used by the Picture.
function findHeadShot(pic) {
  if (!pic) return "images/HSnopic.png"; // There are only 16 images on the server
  return "images/HS" + pic;
}

// define the Node template
myDiagram.nodeTemplate =
  $(go.Node, "Spot",
    {
      selectionObjectName: "BODY",
      click : (e, node) => {
        focusOnNode(e, node)
    },
      mouseEnter: (e, node) => {
        node.findObject("BUTTON").opacity = node.findObject("BUTTONX").opacity = 1},
      mouseLeave: (e, node) => node.findObject("BUTTON").opacity = node.findObject("BUTTONX").opacity = 0,
      // handle dragging a Node onto a Node to (maybe) change the reporting relationship
      mouseDragEnter: (e, node, prev) => {
        const diagram = node.diagram;
        const selnode = diagram.selection.first();
        if (!mayWorkFor(selnode, node)) return;
        const shape = node.findObject("SHAPE");
        if (shape) {
          shape._prevFill = shape.fill;  // remember the original brush
          shape.fill = "darkred";
        }
      },
      mouseDragLeave: (e, node, next) => {
        const shape = node.findObject("SHAPE");
        if (shape && shape._prevFill) {
          shape.fill = shape._prevFill;  // restore the original brush
        }
      },
      mouseDrop: (e, node) => {
        const diagram = node.diagram;
        const selnode = diagram.selection.first();  // assume just one Node in selection
        if (mayWorkFor(selnode, node)) {
          // find any existing link into the selected node
          const link = selnode.findTreeParentLink();
          if (link !== null) {  // reconnect any existing link
            link.fromNode = node;
          } else {  // else create a new link
            diagram.toolManager.linkingTool.insertLink(node, node.port, selnode, selnode.port);
          }
        }
      }
    },
    // for sorting, have the Node.text be the data.name
    new go.Binding("text", "name"),
    // bind the Part.layerName to control the Node's layer depending on whether it isSelected
    new go.Binding("layerName", "isSelected", sel => sel ? "Foreground" : "").ofObject(),
    $(go.Panel, "Auto",
      { name: "BODY" },
      // define the node's outer shape
      $(go.Shape, "Rectangle",
        { name: "SHAPE", fill: "rgba(0,0,0,.8)" , stroke: 'white', strokeWidth: 3.5, portId: "" }),
      $(go.Panel, "Horizontal",
        $(go.Picture,
          {
            name: "Picture",
            desiredSize: new go.Size(70, 70),
            margin: 1.5,
            source: "images/HSnopic.png"  // the default image
          },
          new go.Binding("source", "pic", findHeadShot)),
        // define the panel where the text will appear
        $(go.Panel, "Table",
          {
            minSize: new go.Size(130, NaN),
            maxSize: new go.Size(150, NaN),
            margin: new go.Margin(6, 10, 0, 6),
            defaultAlignment: go.Spot.Left
          },
          $(go.RowColumnDefinition, { column: 2, width: 4 }),
          $(go.TextBlock, textStyle(),  // the name
            {
              name: "NAMETB",
              row: 0, column: 0, columnSpan: 5,
              font: "IRANSansX",
              editable: true, isMultiline: false,
              minSize: new go.Size(50, 16)
            },
            new go.Binding("text", "name").makeTwoWay()),
          $(go.TextBlock, "Title: ", textStyle(),
            { row: 1, column: 0 }),
          $(go.TextBlock, textStyle(),
            {
              row: 1, column: 1, columnSpan: 4,
              editable: true, isMultiline: false,
              minSize: new go.Size(50, 14),
              margin: new go.Margin(0, 0, 0, 3)
            },
            new go.Binding("text", "title").makeTwoWay()),
          $(go.TextBlock, textStyle(),
            { row: 2, column: 0 },
            new go.Binding("text", "key", v => "ID: " + v)),
          $(go.TextBlock, textStyle(),  // the comments
            {
              row: 3, column: 0, columnSpan: 5,
              font: "IRANSansX",
              wrap: go.TextBlock.WrapFit,
              editable: true,  // by default newlines are allowed
              minSize: new go.Size(100, 14)
            },
            new go.Binding("text", "comments").makeTwoWay())
        ) // end Table Panel
      ) // end Horizontal Panel
    ), // end Auto Panel
    $("Button",
      $(go.Shape, "PlusLine", { width: 10, height: 10 }),
      {
        name: "BUTTON", alignment: go.Spot.Right, opacity: 0,  // initially not visible
        click: (e, button) => addEmployee(button.part)
      },
      // button is visible either when node is selected or on mouse-over
      new go.Binding("opacity", "isSelected", s => s ? 1 : 0).ofObject()
    ),
    new go.Binding("isTreeExpanded").makeTwoWay(),
    $("TreeExpanderButton",
      {
        name: "BUTTONX", alignment: go.Spot.Bottom, opacity: 0,  // initially not visible
        "_treeExpandedFigure": "TriangleUp",
        "_treeCollapsedFigure": "TriangleDown"
      },
      // button is visible either when node is selected or on mouse-over
      new go.Binding("opacity", "isSelected", s => s ? 1 : 0).ofObject()
    )
  );  // end Node, a Spot Panel

function addEmployee(node) {
  if (!node) return;
  const thisemp = node.data;
  myDiagram.startTransaction("افزودن سرگروه");
  const newemp = { name: "(کاربر جدید)", title: "(عنوان)", comments: "", parent: thisemp.key };
  myDiagram.model.addNodeData(newemp);
  const newnode = myDiagram.findNodeForData(newemp);
  if (newnode) newnode.location = node.location;
  myDiagram.commitTransaction("افزودن سرگروه");
  myDiagram.commandHandler.scrollToPart(newnode);
}

myDiagram.scrollMargin = 450;

// the context menu allows users to make a position vacant,
// remove a role and reassign the subtree, or remove a department
myDiagram.nodeTemplate.contextMenu =
  $("ContextMenu",
    $("ContextMenuButton",
      $(go.TextBlock, "افزودن سرگروه"),
      {
        click: (e, button) => addEmployee(button.part.adornedPart)
      }
    ),
    $("ContextMenuButton",
      $(go.TextBlock, "Vacate Position"),
      {
        click: (e, button) => {
          const node = button.part.adornedPart;
          if (node !== null) {
            const thisemp = node.data;
            myDiagram.startTransaction("vacate");
            // update the key, name, picture, and comments, but leave the title
            myDiagram.model.setDataProperty(thisemp, "name", "(Vacant)");
            myDiagram.model.setDataProperty(thisemp, "pic", "");
            myDiagram.model.setDataProperty(thisemp, "comments", "");
            myDiagram.commitTransaction("vacate");
          }
        }
      }
    ),
    $("ContextMenuButton",
      $(go.TextBlock, "Remove Role"),
      {
        click: (e, button) => {
          // reparent the subtree to this node's boss, then remove the node
          const node = button.part.adornedPart;
          if (node !== null) {
            myDiagram.startTransaction("reparent remove");
            const chl = node.findTreeChildrenNodes();
            // iterate through the children and set their parent key to our selected node's parent key
            while (chl.next()) {
              const emp = chl.value;
              myDiagram.model.setParentKeyForNodeData(emp.data, node.findTreeParentNode().data.key);
            }
            // and now remove the selected node itself
            myDiagram.model.removeNodeData(node.data);
            myDiagram.commitTransaction("reparent remove");
          }
        }
      }
    ),
    $("ContextMenuButton",
      $(go.TextBlock, "Remove Department"),
      {
        click: (e, button) => {
          // remove the whole subtree, including the node itself
          const node = button.part.adornedPart;
          if (node !== null) {
            myDiagram.startTransaction("remove dept");
            myDiagram.removeParts(node.findTreeParts());
            myDiagram.commitTransaction("remove dept");
          }
        }
      }
    )
  );

// define the Link template
myDiagram.linkTemplate =
  $(go.Link, go.Link.Orthogonal,
    { layerName: "Background", corner: 5 },
    $(go.Shape, { strokeWidth: 1.5, stroke: "#222" }));  // the link shape

// read in the JSON-format data from the "mySavedModel" element
load();


// support editing the properties of the selected person in HTML
if (window.Inspector) myInspector = new Inspector("myInspector", myDiagram,
  {
    properties: {
      "key": { readOnly: true },
      "comments": {}
    }
  });

// Setup zoom to fit button
document.getElementById('zoomToFit').addEventListener('click', () => myDiagram.commandHandler.zoomToFit());

document.getElementById('centerRoot').addEventListener('click', () => {
  myDiagram.scale = 1;
  myDiagram.commandHandler.scrollToPart(myDiagram.findNodeForKey(1));
});
} // end init


// Show the diagram's model in JSON format
function save() {
document.getElementById("mySavedModel").value = myDiagram.model.toJson();
myDiagram.isModified = false;
}


var $ = go.GraphObject.make;

function load() {
myDiagram.model = go.Model.fromJson(data);

// make sure new data keys are unique positive integers
let lastkey = 1;
myDiagram.model.makeUniqueKeyFunction = (model, data) => {
  let k = data.key || lastkey;
  while (model.findNodeDataForKey(k)) k++;
  data.key = lastkey = k;
  return k;
};
}

function focusOnNode(e,node) {  // node is optional
    // If no node is given, choose a node at random, and select it.
      myDiagram.viewportBounds.center
      myDiagram.select(node);
    
      var focus1 = node.copy();
      focus1.layerName = "Tool";
      focus1.isInDocumentBounds = false;
      focus1.locationSpot = go.Spot.Center;
      focus1.location = node.actualBounds.center;
      
      // Figure out how large to scale it initially; assume maximum is one third of the viewport size
       var w = Math.max(node.actualBounds.width, 1);
       //var w = Math.max(e.xu.x);
       var h = Math.max(node.actualBounds.height, 1);
       //var h = Math.max(e.xu.y);
      var viewscale = Math.max(myDiagram.viewportBounds.width/w, myDiagram.viewportBounds.height/h) / 6;
      // Now create the Animation showing the temporary node scaled initially at VIEWSCALE
      var anim = new go.Animation();
      anim.addTemporaryPart(focus1, myDiagram);
      anim.add(focus1, "scale", viewscale, 1.0);  // and animating down to scale 1.0
      // This animation occurs concurrently with the scrolling animation.
      anim.duration = myDiagram.animationManager.duration + 1000;
      anim.start();
      // Meanwhile, make sure that the node is in the viewport, so the user can see it
      myDiagram.commandHandler.scrollToPart(node);
      myDiagram.focus();
    }

window.addEventListener('DOMContentLoaded', init);
