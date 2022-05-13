import { INIT_GAME, PLAYER_INFO, KILL_INFO, WORLD } from '../constants';

type GameInfo = {
  [key: string]: GameDetails;
};

type GameDetails = {
  total_kills: number;
  players: string[];
  kills_by_means: {
    [key: string]: number;
  };
  kills: {
    [key: string]: number;
  };
};

type Action = 'ClientUserinfoChanged:' | 'Kill:';

const makeGetGameInfo = (gameData: string) => {
  return function getGameInfo() {
    try {
      const lines = gameData.split('\n');
      const gameInfo: GameInfo[] = [];
      const FILTER_LINES = [INIT_GAME, PLAYER_INFO, KILL_INFO];

      const filteredLines = lines
        .filter((line) => {
          const [, action] = line.trim().split(' ');
          if (FILTER_LINES.includes(action)) {
            return true;
          }
          return false;
        })
        .reduce(
          (
            previousGame: GameInfo[],
            line: string,
            index: number,
            lines: string[]
          ) => {
            const lastIndex =
              previousGame.length > 0
                ? Math.abs(previousGame.length - 1)
                : previousGame.length;
            const currentGame = previousGame[lastIndex];
            const [, actionName] = line.trim().split(' ');
            const currentLine = line.trim().split(' ');

            if (actionName === INIT_GAME) {
              const game = initGame(previousGame.length);
              previousGame.push(game);
              return previousGame;
            }

            const gameDetail = currentGame[`game-${lastIndex}`];

            const action = getAction(actionName as Action);
            const game = action({ gameDetail, currentLine, index, lines });
            currentGame[`game-${lastIndex}`] = game;
            return previousGame;
          },
          gameInfo
        );
      return filteredLines;
    } catch (error) {
      throw error;
    }
  };
};

const getAction = (action: 'ClientUserinfoChanged:' | 'Kill:') => {
  const actions = {
    [PLAYER_INFO]: getPlayerInfo,
    [KILL_INFO]: getKillInfo,
  };
  return actions[action];
};

const initGame = (index: number): GameInfo => {
  const game = {
    [`game-${index}`]: {
      total_kills: 0,
      players: [],
      kills: {},
      kills_by_means: {},
    },
  };
  return game;
};

const getPlayerInfo = ({
  gameDetail,
  index,
  lines,
}: {
  gameDetail: GameDetails;
  currentLine: string[];
  index: number;
  lines: string[];
}): GameDetails => {
  const player = getPlayerName({ lines, index });
  if (!gameDetail.players.includes(player)) {
    gameDetail.players = [...gameDetail?.players, player];
  }
  return gameDetail;
};

const getPlayerName = ({
  lines,
  index,
}: {
  lines: string[];
  index: number;
}) => {
  const line = lines[index];
  const startIndex = line.indexOf('n\\');
  const endIndex = line.indexOf('\\t') - 1;
  return line.trim().substring(startIndex, endIndex).replace(/\\/g, '');
};

const getKillInfo = ({
  gameDetail,
  currentLine,
}: {
  gameDetail: GameDetails;
  currentLine: string[];
  lines: string[];
}): GameDetails => {
  gameDetail.total_kills++;
  const killer = currentLine[5];

  saveMeansOfDeath({ gameDetail, currentLine });

  if (killer === WORLD) {
    getKillByWorld({ gameDetail, currentLine });
  }

  if (killer !== WORLD) {
    getKillByPlayer({ gameDetail, currentLine, killer });
  }
  return gameDetail;
};

const saveMeansOfDeath = ({
  gameDetail,
  currentLine,
}: {
  gameDetail: GameDetails;
  currentLine: string[];
}) => {
  const meansOfDeath = String(currentLine.at(-1));

  if (typeof gameDetail.kills_by_means[meansOfDeath] === 'number') {
    gameDetail.kills_by_means[meansOfDeath]++;
    return;
  }

  gameDetail.kills_by_means[meansOfDeath] = 1;
};

const getKillByPlayer = ({
  gameDetail,
  killer,
  currentLine,
}: {
  currentLine: string[];
  gameDetail: GameDetails;
  killer: string;
}) => {
  for (let index = 6; index < currentLine.length; index++) {
    if (currentLine[index] === 'killed') {
      break;
    }

    killer += ' ' + currentLine[index];
  }

  if (typeof gameDetail.kills[killer] !== 'number') {
    gameDetail.kills[killer] = 0;
  }

  gameDetail.kills[killer] = gameDetail.kills[killer] + 1;
};

const getKillByWorld = ({
  currentLine,
  gameDetail,
}: {
  currentLine: string[];
  gameDetail: GameDetails;
}) => {
  const killedBy = currentLine.indexOf('killed');
  let killedPlayer = currentLine[killedBy + 1];

  for (let index = killedBy + 2; index < currentLine.length; index++) {
    if (currentLine[index] === 'by') {
      break;
    }
    killedPlayer += ' ' + currentLine[index];
  }

  if (typeof gameDetail.kills[killedPlayer] !== 'number') {
    gameDetail.kills[killedPlayer] = 0;
  }
  gameDetail.kills[killedPlayer] = gameDetail.kills[killedPlayer] - 1;
};

export default makeGetGameInfo;
