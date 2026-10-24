# lockdown protocol
# 3-Arena Multiplayer Tournament

This is a 2-player local multiplayer game made up of three different arenas. You and a friend play on the same keyboard, taking turns being the attacker and the defender in each round. The game keeps track of who wins each arena by passing the score in the website URL, so at the end of the third game, it can calculate the overall tournament winner.

## How it was built

We built this using standard HTML, Canvas, and JavaScript. We didn't use any heavy game engines. We used Tailwind CSS to help style the menus and UI in the second and third arenas. For the sound effects, we used the browser's Web Audio API to generate sounds directly with code instead of loading external sound files.

## The Arenas

Arena 1: Speed Breach
The attacker tries to reach the door on the right side of the screen as fast as possible. The defender tries to stop them by timing laser traps and shooting.

Arena 2: Shifting Maze
The runner tries to get to the green door before time runs out. The defender uses the mouse to click on the grid to build or destroy maze walls in real-time to trap the runner.

Arena 3: Reactor Core
The runner has to get to a button on the other side of the map and hold it down to deactivate it. The defender has to protect the button. There is a central core that randomly shoots out blasts, so both players have to use teleporters to avoid getting hit while fighting.

## How to play

- Download the project and make sure arena_1.html, arena_2.html, and arena_3.html are in the exact same folder.
- Open arena_1.html in your web browser.
- The game will automatically load the next levels as you finish the rounds.

## Controls

Player 1 (Cyan/Blue)
- Move: W, A, S, D keys
- Action or Shoot: Space, E, or Left Shift

Player 2 (Red)
- Move: Arrow keys
- Action or Shoot: Enter, Numpad 0, or Right Shift

The game screen will tell you if a specific level needs a different button for a special trap.
```eof

This version should be much easier to present and defend. It clearly explains what the game is, how it works technically (like passing the score in the URL), and how to play it, without relying on fancy formatting or buzzwords. Let me know if you need to adjust any of the explanations!

<FollowUp>
Are there any specific technical details or challenges you faced while building this that you'd like me to include in the README for the judges?
</FollowUp>
