class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOverScene");
    }

    create() {
        // Add "Game Over" text
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Fin. Thanks for Playing!', {
            fontSize: '64px',
            fill: '#0892d0'
        }).setOrigin(0.5);

        // Add restart button
        let restartButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Restart', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#0000ff',
            padding: { x: 20, y: 10 },
            borderRadius: 5
        }).setOrigin(0.5).setInteractive();

        // Add event listener for the restart button
        restartButton.on('pointerdown', () => {
            this.scene.start('platformerScene');
        });
    }
}