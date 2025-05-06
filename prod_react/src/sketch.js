const sketch = (p, redirector, switch_challenge_descriptor, nodes, edges) => {
  let lockimage;  
  let goimage;
  let completeimage;
  const NODE_COLORS = [[221, 160, 221]];
  const EDGE_COLOR = [255, 255, 255];
  const GLOW_COLOR = [255, 0, 0, 150];
  const TEXT_COLOR = [0, 255, 200];
  
  // Added for responsive layout
  let scaleFactor = 1;
  let offsetX = 0;
  let offsetY = 0;
  let baseWidth = 800; // Base width for scaling calculations
  let baseNodeSize = 40;

  p.preload = () => {
    lockimage = p.loadImage("padlock.png");  
    completeimage = p.loadImage("completeimage.png");
    goimage = p.loadImage("goimage.png");  
  }

  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight / 1.75);
    const container = document.getElementById("p5-container");
    container.style.opacity = 1;
    
    // Calculate scale factor based on screen width
    scaleFactor = Math.min(p.width / baseWidth, 1);
    if (p.width < 600) scaleFactor = p.width / 700; // Additional scaling for mobile
    
    // Initialize nodes with random color indices and adjusted size
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].colorIndex = NODE_COLORS[0];
      nodes[i].size = baseNodeSize * scaleFactor;
      nodes[i].connectionStyle = p.random(1) > 0 ? 'vertical' : 'horizontal';
      
      // Scale node positions
      nodes[i].displayX = nodes[i].x * scaleFactor;
      nodes[i].displayY = nodes[i].y * scaleFactor;
    }
    
    // Add window resize handler
    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight / 1.75);
      scaleFactor = Math.min(p.width / baseWidth, 1);
      if (p.width < 600) scaleFactor = p.width / 600;
      
      // Update node positions and sizes on resize
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].size = baseNodeSize * scaleFactor;
        nodes[i].displayX = nodes[i].x * scaleFactor;
        nodes[i].displayY = nodes[i].y * scaleFactor;
      }
    };
  };

  p.draw = () => {
    p.clear();
    p.translate(p.width / 2, 0);
    drawEdges(p);
    drawNodes(p);
  };

  function drawNodes(p) {
    let nodeHoverIndex = -1;
    let isNodeClickable = false;

    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      node.dashedConnection = (node.state !== "completed");
      
      // Use scaled positions for display
      let d = p.dist(p.mouseX - p.width / 2, p.mouseY, node.displayX, node.displayY);
      let isHovered = d < node.size / 2;
      
      const opacity = 1;
      if (isHovered) {
        switch_challenge_descriptor(i);
        nodeHoverIndex = i;
        isNodeClickable = (node.state == 'unlocked' || node.state == "completed");
        drawNodeGlow(p, node.displayX, node.displayY, node.size * 2, 
                     [GLOW_COLOR[0], GLOW_COLOR[1], GLOW_COLOR[2], GLOW_COLOR[3] * opacity]);
      }

      let nodeColor = NODE_COLORS[0];
      drawTechNode(p, node.displayX, node.displayY, node.size, 
                   [nodeColor[0], nodeColor[1], nodeColor[2]], isHovered, opacity, node.state);
    }

    p.mousePressed = () => {
      if (nodeHoverIndex > -1) {
        redirector(nodeHoverIndex, isNodeClickable);
      }
    };
  }

  function drawNodeGlow(p, x, y, size, glowColor) {
    p.push();
    p.noStroke();
    p.rectMode(p.CENTER);
    for (let i = 50; i > 0; i--) {
      let s = size * (0.1 + i * 0.015);
      let alpha = glowColor[3] / (i * 2);
      p.fill(glowColor[0], glowColor[1], glowColor[2], alpha);
      p.rect(x, y, s, s, 20);
    }
    p.pop();
  }

  function drawTechNode(p, x, y, size, color, isHovered, opacity, state) {
    p.push();
    
    p.translate(x, y);

    p.rectMode(p.CENTER);
    p.noStroke();

    // Node's shadow
    p.fill(0, 0, 0, 50 * opacity);
    p.rect(3 * scaleFactor, 3 * scaleFactor, size, size, 5); 

    // Not The Border
    p.fill(color[0], color[1], color[2], (isHovered ? 255 : 255) * opacity);
    // The border  
    state == "completed" ? p.stroke('#6DCF64') : p.stroke(75, 0, 130, 200 * opacity);
    p.rect(0, 0, size, size, 5);    

    // Main square
    p.noStroke();
    p.rect(0, 0, size * 0.85, size * 0.85);

    let imgSize = size * 0.4;  // Scale the image to fit inside
    p.imageMode(p.CENTER);

    if (state == "unlocked") {
      p.image(goimage, 0, 0, imgSize, imgSize);
    } else if (state == "completed") {
      p.image(completeimage, 0, 0, imgSize, imgSize);
    } else {
      p.image(lockimage, 0, 0, imgSize, imgSize);
    }
  
    p.pop();
  }

  function drawEdges(p) {
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const opacity = 1;
      
      let from = nodes[edge[0]];
      let to = nodes[edge[1]];
      drawTechConnection(
        p, 
        from.displayX, from.displayY, 
        to.displayX, to.displayY, 
        opacity, 
        from.connectionStyle, 
        from.dashedConnection
      );
    }
  }

  function drawTechConnection(p, x1, y1, x2, y2, opacity, connectionStyle, isDashed = false) {
    p.stroke(EDGE_COLOR[0], EDGE_COLOR[1], EDGE_COLOR[2], 255 * opacity);
    p.strokeWeight(2 * scaleFactor);

    // If dashed, use dashed line style
    if (isDashed) {
      p.stroke('#D1D1D1');
      p.strokeWeight(3 * scaleFactor);
      p.drawingContext.setLineDash([5 * scaleFactor, 5 * scaleFactor]); 
    } else {
      p.stroke('#6DCF64');
      p.strokeWeight(3 * scaleFactor);
      p.drawingContext.setLineDash([]); // Solid line
    }

    const arcSize = 10 * scaleFactor;
    
    if (connectionStyle === 'vertical') {
      let right = (x1 < x2);

      // Vertical connection with right-angle turn
      p.push();
      p.noFill();

      if (right) {
        p.translate(x1 + (5 * scaleFactor), ((y1 + y2) / 2) + (5 * scaleFactor));
      } else {
        p.translate(x1 - (5 * scaleFactor), ((y1 + y2) / 2) + (5 * scaleFactor));
      }
      right ? p.rotate(p.radians(180)) : p.rotate(p.radians(270));
      p.arc(0, 0, arcSize, arcSize, 0, Math.PI / 2);
      p.pop();

      // Second curve in the vert lines
      p.push();
      p.noFill();
      if (right) {
        p.translate(x2 - (5 * scaleFactor), ((y1 + y2) / 2) - (5 * scaleFactor));
      } else {
        p.translate(x2 + (5 * scaleFactor), ((y1 + y2) / 2) - (5 * scaleFactor));
      }
      right ? p.rotate(p.radians(0)) : p.rotate(p.radians(90));
      p.arc(0, 0, arcSize, arcSize, 0, Math.PI / 2);
      p.pop();

      p.line(x1, y1, x1, (((y1 + y2) / 2) + (5 * scaleFactor)));
      
      if (right) {
        p.line(x1 + (5 * scaleFactor), (y1 + y2) / 2, x2 - (5 * scaleFactor), (y1 + y2) / 2);
      } else {
        p.line(x1 - (5 * scaleFactor), (y1 + y2) / 2, x2 + (5 * scaleFactor), (y1 + y2) / 2);
      }
      
      p.line(x2, ((y1 + y2) / 2) - (5 * scaleFactor), x2, y2);
    } else {
      // Horizontal connection with right-angle turn
      p.line(x1, y1, (x1 + x2) / 2, y1);
      p.line((x1 + x2) / 2, y1, (x1 + x2) / 2, y2);
      p.line((x1 + x2) / 2, y2, x2, y2);
    }

    p.drawingContext.setLineDash([]);
  }
};

export default sketch;