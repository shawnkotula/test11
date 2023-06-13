 
function createWorld() {
    for (var i = 0; i < 10; i++) {
        var platform = platforms.create(Math.random() * (game.world.bounds.width - 200), game.world.height - Math.random() * 500, 'platform');
        platform.body.immovable = true;
        var enemy = enemies.create(Math.random() * (game.world.bounds.width - 170), game.world.height - Math.random() * 200 - 100, 'enemy'); // Modification: Spawn the enemy above the ground
        enemy.body.gravity.y = 300;
        enemy.body.collideWorldBounds = true;
        enemy.health = 100;
        enemy.healthBar = game.add.graphics(0, 0);
        updateHealthBar(enemy);

        // Modification: Create goobee enemy
        var goobee = goobees.create(Math.random() * (game.world.bounds.width - 170), game.world.height - Math.random() * 200 - 300, 'goobee'); // Spawn the goobee above the ground
        goobee.body.gravity.y = 0; // The enemy doesn't fall
        goobee.body.collideWorldBounds = true;
        goobee.health = 100;
        goobee.healthBar = game.add.graphics(0, 0);
        updateHealthBar(goobee);
    }
    door = game.add.sprite(game.world.bounds.width - 170, game.world.height - 140, 'door');
    game.physics.arcade.enable(door);
    door.body.immovable = true;
}

function update() {


game.physics.arcade.overlap(player, goobees, playerHitGoobee, null, this);

	game.physics.arcade.overlap(bullets, goobees, bulletHitEnemy, null, this);
game.physics.arcade.overlap(missiles, goobees, missileHitEnemy, null, this);
    // Check which direction the player is moving and flip the sprite accordingly
    if (player.body.velocity.x > 0) {
        player.scale.x = Math.abs(player.scale.x);
    } else if (player.body.velocity.x < 0) {
        player.scale.x = -Math.abs(player.scale.x);
    }
    

    game.physics.arcade.overlap(bullets, enemies, bulletHitEnemy, null, this);

     if (player.y >= game.world.height) {
        player.kill();
		gameOver();
    }
	  goobees.forEachAlive(function (goobee) {
        goobee.body.velocity.y = 50 * Math.sin(game.time.now / 500); // make the goobee hover
        updateHealthBar(goobee);
    }, this);

    game.physics.arcade.collide(player, [platforms, grounds]);
game.physics.arcade.collide(player, door, reachDoor);
game.physics.arcade.collide(enemies, [platforms, grounds]);
    game.physics.arcade.collide(enemies, [platforms, grounds]);
    game.physics.arcade.overlap(missiles, enemies, missileHitEnemy, null, this);
    game.physics.arcade.overlap(player, enemies, playerHitEnemy, null, this);
    game.physics.arcade.collide(missiles, [platforms, grounds], missileHitPlatform, null, this);
    player.body.velocity.x = 0;
    var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.E);
    if (game.physics.arcade.overlap(player, door) && enterKey.isDown) {
        winText.visible = true;
    }

     if (fireMissileKey.isDown && game.time.now - lastMissile > 2000) {
        fireMissile();
        lastMissile = game.time.now;
    } 
    if (fireBulletKey.isDown && game.time.now - lastBullet > bulletCooldown) {
        fireBullet();
        lastBullet = game.time.now;
    }

    if (cursors.left.isDown) {
        player.body.velocity.x = -150;
        lastMoveDirection = -1;
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 150;
        lastMoveDirection = 1;
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -350;
    }

    enemies.forEachAlive(function (enemy) {
    if (enemy.body.velocity.x === 0 || enemy.body.blocked.left || enemy.body.blocked.right) {
        enemy.body.velocity.x = 100 - Math.random() * 200;
    }
    updateHealthBar(enemy);
}, this);

	updateHealthBar(player);
}


function reachDoor(player, door) {
    winText.x = door.x;
    winText.y = door.y;
    winText.visible = true;
}


function gameOver() {
    gameOverText.visible = true;
    restartButton.visible = true;
    game.paused = true;
}

function restartGame() {
    game.paused = false;
    game.state.restart();
}

window.onload = function () {
    game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
};