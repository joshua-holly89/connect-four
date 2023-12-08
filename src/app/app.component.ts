import { Component, OnInit, inject } from '@angular/core';
import { StoneColour as StoneColourText } from './StoneColour';
import { Player } from './Player';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './components/dialog/dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  public board: (StoneColourText) [][] = [];
  private currentPlayer: Player = "yellow";
  private winner: Player | null = null;
  private readonly NUMBER_OF_ROWS = 6;
  private isGameRunning: boolean = true;
  private dialog = inject(MatDialog)

  ngOnInit(): void {
    this.initGame();
  }

  private initGame(){
    this.board = [];
    this._initBoard();
    this.isGameRunning = true;
    this.winner = null;
  }

  public makeATurn(columnIndex: number){
    if(this.isGameRunning == false){
      this.dialog.open(DialogComponent, {
        data: {
          message: 'Game is already over!',
          isConfirm: false
        }
      });
      return;
    }
    try{
      let firstFreeRow = this.findFirstFreeRow(columnIndex);
      this.board[firstFreeRow][columnIndex] = this.currentPlayer;
    } catch(SelectedColumnFullError){
      this.dialog.open(DialogComponent, {
        data: {
          message: 'Selected column is full',
          isConfirm: false
        }
      });
      return;
    }

    this.findAWinner();
    this.switchPlayer();
  }

  startGame(){
    if(this.isGameRunning){
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          message: 'Do you really want to start a new game?',
          isConfirm: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.initGame();
        }
      });
    } else {
      this.initGame();
    }
  }

  private findAWinner() {
    this.checkRowsForWinner("red");
    this.checkRowsForWinner("yellow");
    this.checkColumnsForWinner("red");
    this.checkColumnsForWinner("yellow");
    this.checkDiagonalsForWinner("red");
    this.checkDiagonalsForWinner("yellow");
    if(this.winner != null){
      this.dialog.open(DialogComponent, {
        data: {
          message:
            'Winner is ' +
            this.winner +
            this.colourTextToColourSymbol(this.winner),
          isConfirm: false,
        },
      });
      this.isGameRunning = false;
    }
  }

  private checkRowsForWinner(player: string): void {
    for (let row of this.board) {
        let count = 0;
        for (let cell of row) {
            if (cell === player) {
                count++;
                if (count >= 4) {
                  this.winner = player;
                  return;
                }
            } else {
                count = 0;
            }
        }
    }
}

private checkColumnsForWinner(player: string): void {
  for (let col = 0; col < this.board[0].length; col++) {
      let count = 0;
      for (let row = 0; row < this.board.length; row++) {
          if (this.board[row][col] === player) {
              count++;
              if (count >= 4){
                this.winner = player;
                return;
              }
          } else {
              count = 0;
          }
      }
  }
}

private checkDiagonalsForWinner(player: string): void {
  let rowCount = this.board.length;
  let colCount = this.board[0].length;
  // check for diagonals from top-left to bottom-right
  for (let row = 0; row < rowCount - 3; row++) {
      for (let col = 0; col < colCount - 3; col++) {
          if (this.board[row][col] === player && this.board[row+1][col+1] === player &&
              this.board[row+2][col+2] === player && this.board[row+3][col+3] === player) {
              this.winner = player;
              return;
          }
      }
  }
  // check for diagonals from bottom-left to top-right
  for (let row = 3; row < rowCount; row++) {
      for (let col = 0; col < colCount - 3; col++) {
          if (this.board[row][col] === player && this.board[row-1][col+1] === player &&
              this.board[row-2][col+2] === player && this.board[row-3][col+3] === player) {
              this.winner = player;
              return;
          }
      }
  }
}

  private switchPlayer() {
    if (this.currentPlayer === "yellow") {
      this.currentPlayer = "red";
    } else if (this.currentPlayer === "red") {
      this.currentPlayer = "yellow";
    }
  }

  private findFirstFreeRow(columnIndex: number) {
    let rowIndex = this.NUMBER_OF_ROWS - 1;
    while (rowIndex >= 0) {
      const element = this.board[rowIndex][columnIndex];
      if (element === null) {
        return rowIndex;
      }
      rowIndex--;
    }
    throw new SelectedColumnFullError("Selected column is full");
  }

  private positionToColourText(columnIndex: number, rowIndex: number){
    return this.board[rowIndex][columnIndex];
  }

  public positionToColourSymbol(columnIndex: number, rowIndex: number) {
    return this.colourTextToColourSymbol(this.positionToColourText(columnIndex, rowIndex));
  }

  private colourTextToColourSymbol(colourText: StoneColourText) {
    switch (colourText) {
      case ("yellow"): {
        return "🟡";
      }
      case ("red"): {
        return "🔴";
      }
      case (null): {
        return "";
      }
      default: {
        throw new Error("Unknown player");
      }
    }
  }

  private _initBoard() {
    for (let index = 0; index < 6; index++) {
      this.board.push([null, null, null, null, null, null, null]);
    }
  }
}

class SelectedColumnFullError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NoFreeRowError';
  }
}
