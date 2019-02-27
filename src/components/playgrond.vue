<template>
  <div
    style="background: #74c4fd;user-focus: none;user-select: none;"
    :style="`width: ${playGround.x}px;height: ${playGround.y}px;border: 1px solid`"
    @mousemove="follow"
    @touchmove.stop="touch"
    @click.stop="e=>{e.preventDefault()}"
  >
    <div v-if="start"
         style="pointer-events: none"
    >
      <div style="float: right;margin: 10px"> 最高分：{{playGround.highest_score}} 得分：{{playGround.score}}</div>
      <object-dom :object="airplane"></object-dom>
      <object-dom
        :playGround="playGround"
        @crash="crash()"
        @del="delEnemy(i)"
        @atk="shootEnemy"
        :player="airplane"
        :enemies="enemies"
        :object="enemy"
        v-if="isValidObj(enemy)"
        v-for="enemy,i in enemies"
        :key="enemy.id">
      </object-dom>
    </div>
    <div v-else>
      <object-dom
        :playGround="playGround"
        @crash="crash()"
        @del="delEnemy(i)"
        @atk="shootEnemy"
        :player="airplane"
        :enemies="enemies"
        :airplane="enemy"
        v-if="isValidObj(enemy)"
        v-for="enemy,i in enemies"
        :key="enemy.id">
      </object-dom>
      <div style="margin-top: 20%;font-size: 300%;color: white">
        Groovy打飞机
      </div>
      <img src="/static/media/airplane.png" height="100" style="margin-top:10%">
      <div
        style="margin:0 20%;margin-top:10%;padding: 40px;;border-radius: 20px;background: rgba(255,255,255,0.8);font-size: 200%;"
        @click="startGame">
        开始游戏
      </div>
    </div>
  </div>
</template>

<script>
  import airplane from './airplane.js'
  import objectDom from "./object";

  export default {
    name: "playgrond",
    components: {objectDom},
    data() {
      return {
        start: false,
        airplane: new airplane.object(0, 0, 50, 50),
        playGround: {
          x: document.body.clientWidth > 500 ? 500 : document.body.clientWidth,
          y: window.innerHeight > 700 ? window.innerHeight : 700,
          score: 0,
          highest_score: (window.localStorage.getItem("highest_score") * 1) || 0
        },
        enemies: [],
        tik: 0,
        game_args:
          {
            gc_f: 500,
            shoot_f: 200,
            enemy_f: 2000,
            decEnemy_f_t: 1000,
            decEnemy_f_step: 0.95,
            tool_f_t: 5000,
            airplane_size: 50,
            chasing_mode: false
          }
        ,
        default_game_args: '',
        tools: [
          {
            name: "分",
            color: "radial-gradient(yellow,orange)",
            func: () => {
              this.playGround.score += 500
            }
          },
          {
            name: "毒",
            color: "radial-gradient(green,yellow)",
            func: () => {
              this.playGround.score -= 500
              if (this.playGround.score < 0) {
                this.crash()
              }
            }
          },
          {
            name: "速",
            color: "radial-gradient(red,blue)",
            func: () => {
              this.game_args.shoot_f *= 0.5
              setTimeout(() => {
                this.game_args.shoot_f /= 0.5
              }, 5000)
            }
          },
          {
            name: "慢",
            color: "radial-gradient(blue,red)",
            func: () => {
              this.game_args.shoot_f *= 2
              setTimeout(() => {
                this.game_args.shoot_f /= 2
              }, 5000)
            }
          },
          {
            name: "小",
            color: "radial-gradient(green,blue)",
            func: () => {
              this.airplane.height = this.game_args.airplane_size / 2
              this.airplane.width = this.game_args.airplane_size / 2
              setTimeout(() => {
                this.airplane.height = this.game_args.airplane_size
                this.airplane.width = this.game_args.airplane_size
              }, 5000)
            }
          },
          {
            name: "大",
            color: "radial-gradient(blue,green)",
            func: () => {
              this.airplane.height = this.game_args.airplane_size * 2
              this.airplane.width = this.game_args.airplane_size * 2
              setTimeout(() => {
                this.airplane.height = this.game_args.airplane_size
                this.airplane.width = this.game_args.airplane_size
              }, 5000)
            }
          },
          {
            name: "炸",
            color: "radial-gradient(white,red)",
            speedY: 5,
            func: () => {
              let clear = () => {
                this.vibrate(50)
                this.enemies.map((e) => {
                  if (e.type === 2) {
                    this.shootEnemy(e, false)
                  }
                })
              }
              setTimeout(clear, 0)
              setTimeout(clear, 500)
              setTimeout(clear, 1000)
              setTimeout(clear, 1500)
            }
          },
          {
            name: "杀",
            color: "radial-gradient(red,white)",
            speedY: 5,
            func: () => {
              this.enemies.map(s => {
                s.speedX = -(s.x - this.airplane.x) / (this.airplane.y - s.y) * s.speedY
              })
              let tmp = this.game_args.enemy_f
              this.game_args.chasing_mode = true
              this.game_args.enemy_f /= 2
              setTimeout(() => {
                this.game_args.chasing_mode = false
                this.game_args.enemy_f = tmp
              }, 5000)
            }
          },
        ]
      }
    },
    created() {
      setTimeout(this.newCloud, 0)
      setTimeout(this.gc, this.game_args.gc_f)
      window.onresize = (e) => {
        this.playGround.x = document.body.clientWidth > 500 ? 500 : document.body.clientWidth
        this.playGround.y = window.innerHeight > 700 ? window.innerHeight : 700
        console.log(this.playGround)
      }
    },
    methods: {
      startGame() {
        this.start = true
        this.default_game_args = JSON.stringify(this.game_args)
        this.init()
        setTimeout(this.newEnemy, this.game_args.enemy_f)
        setTimeout(this.newTool, this.game_args.tool_f_t)
        setTimeout(this.decEnemy_f, this.game_args.decEnemy_f_t)
        window.onkeydown = (e) => {
          e.preventDefault()
          switch (e.key[5]) {
            case 'L':
              this.keyPress('x', -1);
              break;
            case 'R':
              this.keyPress('x', 1);
              break;
            case 'D':
              this.keyPress('y', 1);
              break;
            case 'U':
              this.keyPress('y', -1);
              break;
          }
        }
      },
      vibrate(time) {
        return navigator.vibrate && navigator.vibrate(time)
      },
      decEnemy_f() {
        this.game_args.enemy_f *= this.game_args.decEnemy_f_step
        setTimeout(this.decEnemy_f, this.game_args.decEnemy_f_t)
      },
      init() {
        this.airplane = new airplane.object(0, 0, this.game_args.airplane_size, this.game_args.airplane_size)
        this.airplane.type = 1
        this.airplane.x = this.playGround.x / 2
        this.airplane.y = this.playGround.y - this.airplane.height - 50
        this.enemies = []
        this.game_args = JSON.parse(this.default_game_args)
        this.playGround.score = 0
        this.shoot()
      },
      gc() {
        this.enemies = this.enemies.filter(enemy => {
          return this.isValidObj(enemy)
        })
        setTimeout(this.gc, this.game_args.gc_f)
      },
      isValidObj(obj) {
        let playGround = this.playGround
        return obj.type !== 5 && obj.y < playGround.y && obj.y >= 0 && obj.x >= 0 && obj.x < playGround.x
      },
      shoot() {
        if (this.airplane.type !== 1) {
          return
        }
        let s = new airplane.object(this.airplane.x, this.airplane.y - this.airplane.height, 3, 10)
        s.type = 3
        s.speedY = -20
        s.hp = 50
        this.enemies.push(s)
        setTimeout(this.shoot, this.game_args.shoot_f)
      },
      newCloud() {
        for (let i = 0; i < Math.random() * 5; i++) {
          let x = Math.ceil(Math.random() * this.playGround.x);
          let y = 0
          let s = new airplane.object(x, y, Math.random() * 20 + 10, Math.random() * 20 + 10)
          s.speedY = Math.random() * 30 + 15
          s.type = 0
          s.speedX = Math.random() * 10 - 5
          s.id = this.tik
          this.tik += 1
          this.enemies.push(s)
        }
        setTimeout(this.newCloud, Math.random() * 2000)
      },
      newTool() {
        let x = Math.ceil(Math.random() * this.playGround.x);
        let y = 0
        let s = new airplane.object(x, y, 30, 30)
        s.type = 6
        s.speedX = 0
        s.speedY = Math.random() * 5 + 5
        let tool = this.tools[Math.floor(Math.random() * this.tools.length)]
        for (let key in tool) {
          s[key] = tool[key]
        }
        s.id = this.tik
        this.tik += 1
        this.enemies.push(s)
        setTimeout(this.newTool, this.game_args.tool_f_t)
      },
      newEnemy() {
        let x = Math.ceil(Math.random() * this.playGround.x);
        let y = 0
        let size_arr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3];
        let select = size_arr[Math.floor(Math.random() * size_arr.length)];
        let base = 50;
        let s = new airplane.object(x, y, Math.sqrt(select) * base, Math.sqrt(select) * base);
        s.speedY = Math.random() * (10 + this.playGround.score / 2000) + Math.sqrt(this.playGround.score) / 10;
        s.speedY /= select
        if (this.game_args.chasing_mode || select > 1) {
          s.speedX = -(x - this.airplane.x) / (this.airplane.y - y) * s.speedY
        } else {
          s.speedX = Math.random() * 5 - 2.5
        }
        s.id = this.tik;
        s.score = base * select;
        s.hp = s.score;
        this.tik += 1;
        this.enemies.push(s)

        setTimeout(this.newEnemy, Math.random() * this.game_args.enemy_f)
      },
      checkPosition(clientX, clientY) {
        if (this.airplane.type !== 1) {
          return
        }
        let max_x = this.playGround.x - this.airplane.width / 2;
        let min_x = this.airplane.width / 2;
        let max_y = this.playGround.y - this.airplane.height / 2;
        let min_y = this.airplane.height / 2;
        this.airplane.x = clientX > min_x ? (clientX < max_x ? clientX : max_x) : min_x;
        this.airplane.y = clientY > min_y ? (clientY < max_y ? clientY : max_y) : min_y;
      },
      crash() {
        this.airplane.type = 4.2
        setTimeout(() => {
            this.vibrate(200)
          }, 200
        )
        setTimeout(() => {
          if (this.airplane.type === 4.2) {
            if (this.playGround.score > this.playGround.highest_score) {
              this.playGround.highest_score = this.playGround.score
              window.localStorage.setItem("highest_score", this.playGround.highest_score)
            }
            alert("你死了！得分：" + this.playGround.score)

            this.init()
          }
        }, 1000)
      },
      delEnemy(i) {
        this.enemies.splice(i, 1)
      },
      keyPress(way, p) {
        p *= 10
        if (way === 'x') {
          this.checkPosition(this.airplane.x + p, this.airplane.y)
        }
        if (way === 'y') {
          this.checkPosition(this.airplane.x, this.airplane.y + p)
        }

      },
      shootEnemy(enemy, score = true) {
        enemy.type = 4
        enemy.speedY /= 2
        setTimeout(() => {
          enemy.type = 5
        }, 500);
        if (score) {
          this.playGround.score += enemy.score
        } else {
          this.playGround.score += enemy.score / 2
        }

      },

      touch(e) {
        this.checkPosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY - 50)
        e.preventDefault()
      },
      follow(event) {
        this.checkPosition(event.clientX, event.clientY)
      }
    }
  }
</script>

<style scoped>
</style>
