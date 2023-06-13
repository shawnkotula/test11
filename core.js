

var game;
var player;
var platforms;
var grounds;
var cursors;
var missiles;
var fireKey;
var lastMissile = 0;
var lastBullet = 0; // Variable to track the last bullet fired
var bulletCooldown = 600; // Cooldown time for bullets in milliseconds
var enemies;
var fireMissileKey;
var fireBulletKey;
var worldWidth = 3200; // Initial world width - 4 canvas widths
var gameOverText;
var winText;
var door;
var grounds = [];
var lastMoveDirection = 1; // 1 for right, -1 for left
var bullets;
var goobees;
var restartButton;


function preload() {
    game.load.image('player', 'mech3.png');
    game.load.image('enemy', 'man3.png');
    game.load.image('ground', 'ground.png');
    game.load.image('platform', 'platform.png');
    game.load.image('missile', 'missle1.png');
    game.load.image('door', 'door.png');
    game.load.image('bullet', 'bullet1.png');
	game.load.image('goobee', 'goobee1.png');
	game.load.image('gooball', 'gooball.png');
}

function create() {

	var gooballs = game.add.group();
gooballs.enableBody = true;
gooballs.physicsBodyType = Phaser.Physics.ARCADE;
gooballs.createMultiple(50, 'gooball');
gooballs.setAll('checkWorldBounds', true);
gooballs.setAll('outOfBoundsKill', true);


	  gameOverText = game.add.text(game.world.centerX, game.world.centerY, 'Game Over! Click the button to Retry', {
        fontSize: '32px',
        fill: '#ff0000'
    });
    gameOverText.anchor.setTo(0.5);
    gameOverText.visible = false;
	
	restartButton = game.add.button(game.world.centerX, game.world.centerY + 50, 'restartButton', restartGame, this);
    restartButton.visible = false;

	goobees = game.add.group();
goobees.enableBody = true;
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(50, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, worldWidth, game.world.height);
    grounds = game.add.group(); // Initializing the grounds group
    grounds.enableBody = true; // Enabling the physics body for the grounds group
    for (var i = 0; i < game.world.bounds.width / 70; i++) {
        if (i % 4 !== 0 && i % 7 !== 0 && i % 10 !== 0) { // Customize the gap positions as needed
            ground = grounds.create(i * 70, game.world.height - 70, 'ground');
            ground.body.immovable = true;
        }
    }
    platforms = game.add.group();
    platforms.enableBody = true;
    enemies = game.add.group();
    enemies.enableBody = true
	
    createWorld();
    player = game.add.sprite(100, game.world.height - 350, 'player');
    player.scale.y = Math.min(125 / player.height, 1);
    player.scale.x = player.scale.y;
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    player.health = 100;
	var enemy = enemies.create(Math.random() * (game.world.bounds.width - 170), game.world.height - Math.random() * 200 - 100, 'enemy');
enemy.health = 100; // moved this line here

var goobee = goobees.create(Math.random() * (game.world.bounds.width - 170), game.world.height - Math.random() * 200 - 300, 'goobee');
goobee.health = 100; // moved this line here
    player.hitTimer = game.time.now; // moved this line here
    player.healthBar = game.add.graphics(0, 0);
    updateHealthBar(player);
    game.camera.follow(player);
    missiles = game.add.group();
    missiles.enableBody = true;
    missiles.physicsBodyType = Phaser.Physics.ARCADE;
    missiles.callAll('scale.setTo', 'scale', 0.5, 0.5);  // Scaling down missiles
    bullets.callAll('scale.setTo', 'scale', 0.5, 0.5);
    cursors = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
    };
    fireMissileKey = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    fireBulletKey = game.input.keyboard.addKey(Phaser.Keyboard.TWO);


    game.input.mouse.capture = true; // Enable mouse input
    gameOverText = game.add.text(game.world.centerX, game.world.centerY, 'Game Over! Press R to Retry', {
        fontSize: '32px',
        fill: '#ff0000'
    });
    gameOverText.anchor.setTo(0.5);
    gameOverText.visible = false;
    winText = game.add.text(game.world.centerX, game.world.centerY, 'You Win!', {
        fontSize: '32px',
        fill: '#00ff00'
    });
    winText.anchor.setTo(0.5);
    winText.visible = false;
}

function spitGooball(goobee) {
    var gooball = gooballs.getFirstDead();
    if (gooball) {
        // Set the gooball position to the goobee's position
        gooball.reset(goobee.x, goobee.y);
        // Shoot the gooball at a slight trajectory
        gooball.body.velocity.y = -100; // Shoot upwards
        gooball.body.velocity.x = (Math.random() < 0.5 ? -1 : 1) * 50; // Shoot in a random horizontal direction
    }
	
	goobees.forEachAlive(function(goobee) {
    if (game.time.now - goobee.lastGooball > 2000) { // Check if it's time to spit out a gooball
        spitGooball(goobee);
        goobee.lastGooball = game.time.now;
    }
});
}

function playerHitGoobee(player, goobee) {
    if (game.time.now - player.hitTimer > 1000) {
        player.health -= 25; // 25 hp for goobee
        player.hitTimer = game.time.now;
        if (player.health <= 0) {
            player.kill();
        } else {
            updateHealthBar(player);
        }
    }
}

function updateHealthBar(character) {
    if (character.healthBar) {
        character.healthBar.clear();
        character.healthBar.beginFill(0xff0000, 1);
        character.healthBar.drawRect(0, 0, 50 * (character.health / 100), 5);
        character.healthBar.endFill();
        character.healthBar.x = character.x + character.width / 2 - 25;
        character.healthBar.y = character.y - 20;
    }
}





function fireMissile() {
    var missile = missiles.create(player.x + player.width / 2, player.y + player.height / 2, 'missile');
    missile.scale.setTo(0.5, 0.5); // Make missile 50% smaller
    game.physics.arcade.moveToPointer(missile, 500);
    missile.rotation = game.physics.arcade.angleToPointer(missile);
}

function fireBullet() {
    var bullet = bullets.getFirstDead();
    if (bullet) {
        bullet.reset(player.x + player.width / 2, player.y + player.height / 2);
        bullet.scale.setTo(0.5, 0.5); // Make bullet 50% smaller
        game.physics.arcade.moveToPointer(bullet, 500);
        bullet.rotation = game.physics.arcade.angleToPointer(bullet);
    }
}

function missileHitEnemy(missile, enemy) {
    var explosionRadius = 100; // Radius of the explosion
    var explosionCircle = new Phaser.Circle(missile.x, missile.y, explosionRadius * 2); // Create a circle for the explosion
    enemies.forEachAlive(function(otherEnemy) {
        if (Phaser.Circle.contains(explosionCircle, otherEnemy.x, otherEnemy.y)) {
            var distance = Phaser.Math.distance(missile.x, missile.y, otherEnemy.x, otherEnemy.y);
           var damage = Phaser.Math.linear((otherEnemy.key === 'goobee' ? 75 : 50), 0, distance / explosionRadius); // 75 hp for goobee and 50 hp for normal enemy

            otherEnemy.health -= damage;
            if (otherEnemy.health <= 0) {
    otherEnemy.healthBar.kill();
    otherEnemy.kill();
} else {
    updateHealthBar(otherEnemy);
}
        }
    });
    missile.kill();
}

function bulletHitEnemy(bullet, enemy) {
    bullet.kill();
    enemy.health -= (enemy.key === 'goobee') ? 40 : 20; // 40 hp for goobee and 20 hp for normal enemy
    if (enemy.health <= 0) {
        enemy.healthBar.kill();
        enemy.kill();
    } else {
        updateHealthBar(enemy);
    }
}

function playerHitEnemy(player, enemy) {
    if (game.time.now - player.hitTimer > 1000) {
        player.health -= (enemy.key === 'goobee') ? 25 : 10; // 25 hp for goobee and 10 hp for normal enemy
        player.hitTimer = game.time.now;
        if (player.health <= 0) {
            player.kill();
			gameOver();
        } else {
            updateHealthBar(player);
        }
    }
}

function missileHitPlatform(missile, platform) {
    missile.kill();
}
