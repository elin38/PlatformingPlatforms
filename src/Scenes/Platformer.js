class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -550;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.nigiriCount = 0;
        this.sushiCount = 0;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 120, 20);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("foodie_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 87
        });

        this.token = this.map.createFromObjects("Objects", {
            name: "token",
            key: "tilemap_sheet",
            frame: 88
        });

        this.end_Token = this.map.createFromObjects("Objects", {
            name: "end game",
            key: "tilemap_sheet",
            frame: 82
        });

        this.secret_Token = this.map.createFromObjects("Objects", {
            name: "secret",
            key: "tilemap_sheet",
            frame: 43
        });
        
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.token, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.end_Token, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.secret_Token, Phaser.Physics.Arcade.STATIC_BODY);
        

        // Create a Phaser group out of the array for collectables
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.tokenGroup = this.add.group(this.token);
        this.endTokenGroup = this.add.group(this.end_Token);
        this.secretTokenGroup = this.add.group(this.secret_Token);
        
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 100, "platformer_characters", "tile_0000.png");
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.sound.play("collect", {
                volume: 0.15   // Can adjust volume using this, goes from 0 to 1
            });
            this.sushiCount += 1;
        });

        this.physics.add.overlap(my.sprite.player, this.tokenGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.sound.play("collect2", {
                volume: 0.15   // Can adjust volume using this, goes from 0 to 1
            });
            this.nigiriCount += 1;
        });

        this.physics.add.overlap(my.sprite.player, this.endTokenGroup, (obj1, obj2) => {
            my.text.interact.visible = true;
            my.text.interact.x = obj2.x-20;
            my.text.interact.y = obj2.y-30;
            if(Phaser.Input.Keyboard.JustDown(this.eKey) && this.nigiriCount == 3) {
                this.sound.play("finish", {
                    volume: 0.15   // Can adjust volume using this, goes from 0 to 1
                });
                this.scene.start("gameOverScene");
            } else {
                my.text.collectables.visible = true;
                my.text.collectables.x = my.sprite.player.x-20;
                my.text.collectables.y = my.sprite.player.y-45;
                my.text.collectables.setText("Nigiri: " + this.nigiriCount + "/3");
            }
        });

        this.physics.add.overlap(my.sprite.player, this.secretTokenGroup, (obj1, obj2) => {
            my.text.interact.visible = true;
            my.text.interact.x = obj2.x-20;
            my.text.interact.y = obj2.y-30;
            if(Phaser.Input.Keyboard.JustDown(this.eKey) && this.nigiriCount == 3 && this.sushiCount == 13) {
                this.sound.play("finish", {
                    volume: 0.15   // Can adjust volume using this, goes from 0 to 1
                });
                this.scene.start("secretScene");
            } else {
                my.text.collectables.visible = true;
                my.text.collectables.x = my.sprite.player.x-42;
                my.text.collectables.y = my.sprite.player.y-45;
                my.text.collectables.setText("Collectables: " + (this.sushiCount+this.nigiriCount) + "/16");
            }
        });
        
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');
        this.eKey = this.input.keyboard.addKey('E');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_01.png', 'circle_02.png', 'circle_03.png','circle_04.png','circle_05.png'],
            random: true,
            scale: {start: 0.01, end: 0.07},
            // maxAliveParticles: 25,
            lifespan: 200,
            gravityY: -750,
            alpha: {start: 0.5, end: 0.1}, 
        });
        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_08.png'],
            scale: {start: 0.1, end: 0.2},
            lifespan: 400,
            gravityY: -50,
            alpha: {start: 2, end: 0.1}, 
        });
        my.vfx.jumping.stop();
        

        //camera code
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        // console.log(this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(5, 5);
        this.cameras.main.setZoom(this.SCALE);

        //add text:
        my.text.interact =
        this.add.text(my.sprite.player.x, my.sprite.player.y, "Press \"E\"", {
            fontFamily: 'Times, serif',
            fontSize: 12,
            wordWrap: {
                width: 250
            }
        });
        my.text.interact.visible = false;

        my.text.collectables =
        this.add.text(my.sprite.player.x, my.sprite.player.y, "Nigiri: " + this.nigiriCount + "/3", {
            fontFamily: 'Times, serif',
            fontSize: 12,
            wordWrap: {
                width: 250
            }
        });
        my.text.collectables.visible = false;
    }

    update() {
        
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            //have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

            //jumping vfx
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2, false);
            my.vfx.jumping.setParticleSpeed(0, 0);
            my.vfx.jumping.start();
            this.sound.play("jump", {
                volume: 0.25   // Can adjust volume using this, goes from 0 to 1
            });
        } 
        else {
            my.vfx.jumping.stop();
        }

        // Check for overlap with endTokenGroup and hide text if not overlapping
        const isOverlapping = this.physics.overlap(my.sprite.player, this.endTokenGroup);
        const isOverlapping2 = this.physics.overlap(my.sprite.player, this.secretTokenGroup);
        if (!isOverlapping && !isOverlapping2) {
            my.text.interact.visible = false;
            my.text.collectables.visible = false;
        }
    }
}