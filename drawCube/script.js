window.onload = () => {
  const canvas = document.querySelector(".canvas");
  const ctx = canvas.getContext("2d");
  const fullSCreenbtn = document.querySelector(".fullscreen");

  fullSCreenbtn.addEventListener("click", () => {
    canvas.requestFullscreen();
  });

  const width = canvas.width;
  const height = canvas.height;

  const cube = new Cube({ x: 0, y: 0, z: 0 }, 200);
  const fov = 400;
  const distance = 500;

  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    previousMousePosition = getMousePos(canvas, e);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const currentMousePosition = getMousePos(canvas, e);
      const deltaX = currentMousePosition.x - previousMousePosition.x;
      const deltaY = currentMousePosition.y - previousMousePosition.y;

      cube.rotateY(deltaX * 0.005);
      cube.rotateX(deltaY * 0.005);

      previousMousePosition = currentMousePosition;
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);
    cube.draw(ctx, width, height, fov, distance);
    cube.rotateX(0.01);
    cube.rotateY(0.01);
    requestAnimationFrame(draw);
  }

  draw();

  // Usage
};

class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  project(width, height, fov, distance) {
    const factor = fov / (distance + this.z);
    const x = this.x * factor + width / 2;
    const y = this.y * factor + height / 2;
    return { x, y, factor };
  }
}

class Cube {
  constructor(center, size) {
    const d = size / 2;

    this.vertexImage = new Image();
    this.vertexImage.src = "dog1.png"; // Load your image
    this.imageSize = 30;

    this.vertices = [
      new Point(center.x - d, center.y - d, center.z - d),
      new Point(center.x + d, center.y - d, center.z - d),
      new Point(center.x + d, center.y + d, center.z - d),
      new Point(center.x - d, center.y + d, center.z - d),
      new Point(center.x - d, center.y - d, center.z + d),
      new Point(center.x + d, center.y - d, center.z + d),
      new Point(center.x + d, center.y + d, center.z + d),
      new Point(center.x - d, center.y + d, center.z + d),
    ];

    this.edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0], // front face
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4], // back face
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7], // connecting edges
    ];
  }

  draw(ctx, width, height, fov, distance) {
    const projectedPoints = this.vertices.map((v) =>
      v.project(width, height, fov, distance)
    );

    // Draw edges
    ctx.beginPath();
    ctx.strokeStyle = "black";
    this.edges.forEach((edge) => {
      const p1 = projectedPoints[edge[0]];
      const p2 = projectedPoints[edge[1]];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    });
    ctx.stroke();

    projectedPoints.forEach((point) => {
      const size = this.imageSize * point.factor;
      ctx.drawImage(
        this.vertexImage,
        point.x - size / 2,
        point.y - size / 2,
        size,
        size
      );
    });
  }

  rotateY(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.vertices.forEach((v) => {
      const x = v.x;
      const z = v.z;
      v.x = x * cos - z * sin;
      v.z = z * cos + x * sin;
    });
  }

  rotateX(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.vertices.forEach((v) => {
      const y = v.y;
      const z = v.z;
      v.y = y * cos - z * sin;
      v.z = z * cos + y * sin;
    });
  }
}
