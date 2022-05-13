const getPlayerName = (line: string) => {
  const startIndex = line.indexOf('n\\');
  const endIndex = line.indexOf('\\t') - 1;
  return line.trim().substring(startIndex, endIndex).replace(/\\/g, '');
};

export default getPlayerName;
