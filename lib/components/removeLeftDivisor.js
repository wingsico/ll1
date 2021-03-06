const { randomNT, formatGsArray, formatGsString } = require('../utils');
const { selectSeperator, productionSeperator, emptyChar} = require('../config');

function removeLeftDivisor(grammar = new Grammar()) {
  const productions = grammar.getProductions();
  const newProductions = formatGsString(Object.keys(productions).reduce((acc, key) => {
    const right = productions[key];
    const candicates = right.split(selectSeperator);
    const divisorsList = getCommonLeftDivisor(candicates);
    const { original, newBorn } = getNewProductionRight(divisorsList, candicates, key, [...grammar.getNonTerminator()]);
    acc.push(original, newBorn);
    return acc;
  }, []).filter(v => v).join(productionSeperator));
  grammar.setProductions(formatGsArray(newProductions));
}

function getCommonLeftDivisor(arr = []) {
  const clone = [...arr];
  const sortArr = clone.sort((a, b) => b.length - a.length); // 按长度由长到短排序
  const longest = sortArr[0]; // 最短的候选式
  const leftDivisors = []; // 左因子

  for (let i = 0; i < longest.length; i++) {
    // 第i个字符之前的字符串（包括第i个字符）
    const currentChars = getArrayChildrenCharsByIndex(arr, i);
    // 字符串相等的候选式下标
    const sameCharsIndexs = findArrayChildrenSameIndex(currentChars);

    if (sameCharsIndexs.length === 0) {
      break;
    }

    sameCharsIndexs.forEach((sameCharIndexs = []) => {
      // 记录
      leftDivisors.push({
        prefix: arr[sameCharIndexs[0]].substr(0, i + 1), // 左因子
        arrs: sameCharIndexs, // 包含左因子的数组元素下标
      })
    })
  }
  return combineLeftDivisors(leftDivisors); // 合并后的左因子集合
}

function getNewProductionRight(divisorsList = [], arr = [], left = "" , nts = []) {
  const clone = [...arr];
  const newProductionRight = {
    original: "",
    newBorn: "",
  };

  divisorsList.forEach(({ prefix, arrs }, index) => {
    const newNTProductionRight = arrs.map(index => {
      return arr[index].slice(prefix.length) || emptyChar;
    }).join(selectSeperator);
    const newNTProductionLeft = randomNT(nts);
    nts.push(newNTProductionLeft);
    newProductionRight.newBorn = `${newNTProductionLeft}->${newNTProductionRight}`;

    clone.push(`${prefix}${newNTProductionLeft}`);
    arrs.forEach(index => delete clone[index]);
  })

  newProductionRight.original = `${left}->${clone.filter(v => v).join(selectSeperator)}`

  return newProductionRight;
}

function getArrayChildrenCharsByIndex(arr = [], index = 0) {
  return arr.map(cs => cs.substr(0, index + 1));
}

function findArrayChildrenSameIndex(arr = []) {
  const map = arr.reduce((acc, key, index) => {
    acc[key] === undefined ? acc[key] = [index] : acc[key].push(index);
    return acc;
  }, {});
  return Object.keys(map).filter(key => map[key].length > 1).map(key => map[key]);
}

function combineLeftDivisors(leftDivisors = []) {
  const map = leftDivisors.reduce((acc, { prefix, arrs}) => {
    const key = arrs.join(",");
    if (acc[key] === undefined || prefix.length > acc[key].length) {
      acc[key] = prefix;
    }
    return acc;
  }, {})
  return Object.keys(map).map(arr => {
    return {
      prefix: map[arr],
      arrs: arr.split(","),
    }
  })
}
module.exports = removeLeftDivisor;
