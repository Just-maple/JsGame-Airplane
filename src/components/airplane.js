class object {
  constructor(x, y, width = 20, height = 20, speedX = 0, speedY = 0,type=2) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.speedX = speedX;
    this.speedY = speedY;
    this.height = height;
    this.type = type;
    this.score = 0
    this.hp = 0
  }
}

function objectCollision(objectA, objectB) {
  let ARight = objectA.x + objectA.width / 2;
  let BRight = objectB.x + objectB.width / 2;
  let ALeft = objectA.x - objectA.width / 2;
  let BLeft = (objectB).x - objectB.width / 2;
  let ATop = (objectA).y + objectA.height / 2;
  let ABottom = (objectA).y - objectA.height / 2;
  let BTop = (objectB).y + objectB.height / 2;
  let BBottom = (objectB).y - objectB.height / 2;
  let XCollision = (ARight > BLeft && ALeft <= BRight || BRight > ALeft && BLeft <= ALeft);
  let YCollision = (ATop > BBottom && ABottom <= BTop || BTop > ABottom && BBottom <= ATop);
  return XCollision && YCollision
}

export default {
  object, objectCollision
}
