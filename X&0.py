# Ultimate Tic-Tac-Toe
# Two-player terminal game. Run with: python ultimate_tic_tac_toe.py

WIN_LINES = (
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
)

# Each mini-board contains 9 cells. There are 9 mini-boards.
boards = [[" " for _ in range(9)] for _ in range(9)]
players = ["X", "O"]


def winner(cells):
    """Return 'X' or 'O' if a player has won these 9 cells; otherwise None."""
    for a, b, c in WIN_LINES:
        if cells[a] != " " and cells[a] == cells[b] == cells[c]:
            return cells[a]
    return None


def board_status(board_number):
    """Return X/O for a won mini-board, D for a draw, or None if still open."""
    cells = boards[board_number]
    won_by = winner(cells)
    if won_by:
        return won_by
    if all(cell != " " for cell in cells):
        return "D"
    return None


def overall_winner():
    """Check whether someone has won three mini-boards in a row."""
    statuses = [board_status(i) for i in range(9)]
    for a, b, c in WIN_LINES:
        if statuses[a] in ("X", "O") and statuses[a] == statuses[b] == statuses[c]:
            return statuses[a]
    if all(status is not None for status in statuses):
        return "D"
    return None


def show_board():
    """Display the nine mini-boards as one large 9x9 board."""
    print("\nMini-board numbers:")
    print("  1 | 2 | 3")
    print(" ---+---+---")
    print("  4 | 5 | 6")
    print(" ---+---+---")
    print("  7 | 8 | 9")
    print("\nLarge board (each 3x3 section is a mini-board):")
    for big_row in range(3):
        for small_row in range(3):
            parts = []
            for big_col in range(3):
                board_number = big_row * 3 + big_col
                row_cells = []
                for small_col in range(3):
                    cell_number = small_row * 3 + small_col
                    value = boards[board_number][cell_number]
                    row_cells.append(value if value != " " else ".")
                parts.append(" ".join(row_cells))
            print(" || ".join(parts))
        if big_row < 2:
            print("------+-------+------")
    print("\nMini-board results:")
    for row in range(3):
        labels = []
        for col in range(3):
            b = row * 3 + col
            status = board_status(b)
            labels.append(status if status else str(b + 1))
        print(" | ".join(labels))
        if row < 2:
            print("--+---+--")
    print("(X/O = won by that player, D = drawn, number = still open)\n")


def read_number(prompt):
    while True:
        raw = input(prompt).strip()
        if raw.lower() in ("q", "quit", "exit"):
            print("Game ended.")
            raise SystemExit
        try:
            number = int(raw)
            if 1 <= number <= 9:
                return number - 1
        except ValueError:
            pass
        print("Enter a number from 1 to 9, or Q to quit.")


def main():
    player_index = 0
    # None means the next player may choose any unfinished mini-board.
    target_board = None

    print("ULTIMATE TIC-TAC-TOE")
    print("Enter a mini-board number (1-9), then a cell number (1-9).")
    print("Within each mini-board, cells are numbered:")
    print("  1 2 3\n  4 5 6\n  7 8 9")
    print("The cell you play in sends your opponent to the mini-board")
    print("with the same number. Type Q at any prompt to quit.")

    while True:
        show_board()
        player = players[player_index]

        # If the required destination is already won or drawn, allow a free choice.
        if target_board is not None and board_status(target_board) is not None:
            print(
                f"Mini-board {target_board + 1} is already decided. "
                "You may choose any unfinished mini-board."
            )
            target_board = None

        if target_board is None:
            print(f"Player {player}, choose any unfinished mini-board.")
            while True:
                board_number = read_number("Mini-board (1-9): ")
                if board_status(board_number) is None:
                    break
                print("That mini-board is already won or drawn. Choose another.")
        else:
            board_number = target_board
            print(f"Player {player}, you must play in mini-board {board_number + 1}.")

        while True:
            cell_number = read_number("Cell (1-9): ")
            if boards[board_number][cell_number] == " ":
                break
            print("That cell is occupied. Choose an empty cell.")

        boards[board_number][cell_number] = player

        mini_winner = board_status(board_number)
        if mini_winner in ("X", "O"):
            print(f"Mini-board {board_number + 1} was won by {mini_winner}!")

        game_winner = overall_winner()
        if game_winner == "D":
            show_board()
            print("It's a draw! All mini-boards are decided.")
            break
        if game_winner in ("X", "O"):
            show_board()
            print(f"Player {game_winner} wins the whole game!")
            break

        # The cell number determines the next player's mini-board.
        # If it is already decided, the next turn will allow a free choice.
        target_board = cell_number
        player_index = 1 - player_index


if __name__ == "__main__":
    main()
