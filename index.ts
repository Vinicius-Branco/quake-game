import fs from 'fs';
import makeGetGameInfo from './useCases/getGameInfo';

const execute = () => {
  try {
    const gameData = fs.readFileSync('./data/qgames.log', 'utf8').toString();
    const getGameInfo = makeGetGameInfo(gameData);
    const gameInfo = getGameInfo();
    gameInfo.map((currentGame) => console.log(currentGame));
  } catch (error) {
    throw error;
  }
};

execute();
