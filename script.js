var rowsCount = 10;
var columnsCount = 10;
var bombsCount = 50;
var checkedFieldsCount = 0;

var enabled = false;

var mineSweeperButtons;

var gameField = $("#gameField");

var isGameEnded = false;

function FillBtnsArray(rows, columns, bombs)
{
    if ((rows * columns) < bombs)
    {
        throw "Cant make more bombs than game cells!"
    }

    if (bombs <= 0)
    {
        throw "Bombs value should be greater than 0"
    }

    rowsCount = rows;
    columnsCount = columns;
    bombsCount = bombs;

    mineSweeperButtons = new Array(rowsCount);

    for (var i = 0; i < mineSweeperButtons.length; i++)
    {
        mineSweeperButtons[i] = []
    }

    bombs = 0;

    while (bombsCount > bombs)
    {
        for (var i = 0; i < rowsCount; i++)
        {
            for (var j = 0; j < columnsCount; j++)
            {
                if (mineSweeperButtons[i][j] === undefined)
                {
                    mineSweeperButtons[i][j] = new GameCell();
                    mineSweeperButtons[i][j].isBomb = false;
                    mineSweeperButtons[i][j].state = "None"
                }

                if (bombsCount <= bombs)
                {
                    continue;
                }

                if (mineSweeperButtons[i][j].isBomb === true)
                {
                    continue;
                }

                if ((Math.random() * 100) > 85)
                {
                    mineSweeperButtons[i][j].isBomb = true;
                    bombs++;
                }
            }
        }
    }
}

function DrawGameField()
{
    gameField.html("");

    var styleString = "";

    var columnWidthString = `3rem `;

    for (var i = 0; i < columnsCount; i++)
    {
        styleString += columnWidthString;
    }

    gameField.css("grid-template-columns", styleString)

    for (var i = 0; i < rowsCount; i++)
    {
        for (var j = 0; j < columnsCount; j++)
        {
            var button = document.createElement("button");
            button.className = "ms_btn"
            button.style = "height:3rem;";
            button.setAttribute("onclick", `BtnClick(this, ${ i }, ${ j })`)
            button.setAttribute("onmousedown", `javascript: BtnMouseDown(this, ${ i }, ${ j }, event)`)
            gameField.append(button)
            mineSweeperButtons[i][j].element = button;
        }
    }
}

function BtnMouseDown(elem, row, column, event)
{
    if (!enabled)
        return;

    if (event.which == 3)
    {
        switch (mineSweeperButtons[row][column].state)
        {

            case "Pressed":
                break;
            case "None":
                mineSweeperButtons[row][column].state = "Flagged"
                mineSweeperButtons[row][column].element.innerHTML = `<div class="ms_btn_content"><img class="ms_btn_content" src="FieldIcons/flag.png"></div>`
                checkedFieldsCount++;
                break;
            case "Flagged":
                mineSweeperButtons[row][column].state = "None"
                mineSweeperButtons[row][column].element.innerHTML = ``
                checkedFieldsCount--;
                break;
        }
    }
    UpdateBombsIndicator();
}

function BtnClick(elem, row, column)
{

    if (!enabled)
        return;

    if (mineSweeperButtons[row][column].state === "Pressed" || mineSweeperButtons[row][column].state === "Flagged")
    {
        return;
    }

    mineSweeperButtons[row][column].state = "Pressed";
    if (mineSweeperButtons[row][column].isBomb === true)
    {
        EndGameDead();
        return;
    }
    elem.setAttribute("disabled", "true");

    var minesCount = GetMinesCountNearBy(row, column);

    if (minesCount > 0)
    {
        elem.innerHTML = `<div class="ms_btn_content">${ minesCount }</div>`;
    }
    CheckForWin();
}

function EndGameDead()
{
    if (!enabled)
        return;

    StopTimer();

    $("#PlayerFace").attr("src", "Faces/nervous.png");
    var explosionAudio = new Audio("Sounds/explosion.wav");
    explosionAudio.loop = false;
    explosionAudio.play();

    setTimeout(() =>
    {
        $("body").fadeOut(316).delay(1000).fadeIn(4000);

        setTimeout(() =>
        {
            $("#PlayerFace").attr("src", "Faces/dead.png");
            ShowBombs();
        }, 1000);

        setTimeout(() =>
        {
            $("#gameover").slideDown();
        }, 5000);

    }, 1450);

    enabled = false;
}

function ShowBombs()
{
    for (var i = 0; i < rowsCount; i++)
    {
        for (var j = 0; j < columnsCount; j++)
        {
            if (mineSweeperButtons[i][j].isBomb)
                mineSweeperButtons[i][j].element.innerHTML = `<div class="ms_btn_content"><img class="ms_btn_content " src="FieldIcons/bomb.png"></div>`
        }
    }
}

function GetMinesCountNearBy(row, column)
{
    var count = 0;

    var minesNearby = GetMinesNearBy(row, column);


    minesNearby.forEach(element =>
    {

        if (element.isBomb === true)
        {
            count++;
        }
    });

    if (count <= 0)
    {
        minesNearby.forEach(element =>
        {
            element.element.click();
        });
    }

    return count;
}

function GetMinesNearBy(row, column)
{
    var minesNearby = [];

    for (var i = 0; i < 3; i++)
    {
        var x = row - 1 + i;
        for (var j = 0; j < 3; j++)
        {
            var y = column - 1 + j;

            if ((x == row) && (y == column))
            {
                continue;
            }

            if ((x < 0) || (y < 0) || (x >= rowsCount) || (y >= columnsCount))
            {
                continue;
            }

            minesNearby.push(mineSweeperButtons[x][y]);
        }
    }

    return minesNearby;
}

function CheckForWin()
{
    if (!enabled)
        return;

    for (var i = 0; i < rowsCount; i++)
    {
        for (var j = 0; j < columnsCount; j++)
        {
            if (mineSweeperButtons[i][j].state != "Pressed" && mineSweeperButtons[i][j].isBomb === false)
            {
                return;
            }
        }
    }
    $("#PlayerFace").attr("src", "Faces/win.png");
    StopTimer();
    startConfetti();
    setTimeout(() =>
    {
        stopConfetti();
    }, 3000);

    var applause = new Audio("Sounds/applause.wav");
    applause.loop = false;
    applause.play();

    enabled = false;
}

function UpdateBombsIndicator()
{
    $("#bombsIndicator").text(`${ checkedFieldsCount }/${ bombsCount }`);
}

function LaunchGame(rows, columns, bombs)
{
    StopTimer();
    $("#timer").text("Time elapsed: 0 sec");
    $("#PlayerFace").attr("src", "Faces/normal.png");
    enabled = false;
    checkedFieldsCount = 0;
    FillBtnsArray(rows, columns, bombs);
    DrawGameField();
    UpdateBombsIndicator();
    StartTimer();
    enabled = true;
    $("#menu").fadeOut();
}

//timer

var timer;

function StartTimer()
{
    var gamestartTime = new Date().getTime();
    timer = setInterval(function ()
    {
        var timeNow = new Date().getTime();

        var distance = timeNow - gamestartTime;

        $("#timer").text("Time elapsed: " + Math.floor(distance / 1000) + " sec");
    }, 1000)
}

function StopTimer()
{
    clearInterval(timer);
}

//timer end

function showMenu()
{
    $('#gameover').slideUp(1000)
    $('#menu').delay(1000).fadeIn()
}

function showMenuSimple()
{
    $('#menu').fadeIn()
}

function hideMenu()
{
    $('#gameover').slideUp(1000)
    $('#menu').delay(1000).fadeOut()
}

class GameCell
{
    isBomb;
    state;
    element;
}
// States:
// None
// Flagged
// Pressed

$("#gameover").hide(0);