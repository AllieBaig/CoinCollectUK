/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppVersion = '2.0' | '2.5' | '3.0';

export interface SchemaDefinition {
  version: AppVersion;
  coinFields: string[];
  preferenceFields: string[];
  requiredCoinFields: string[];
}

export const SCHEMAS: Record<AppVersion, SchemaDefinition> = {
  '3.0': {
    version: '3.0',
    coinFields: [
      'id', 'title', 'denomination', 'year', 'summary', 'isCollected', 'isRare',
      'category', 'folderId', 'addedAt', 'imageUrl', 'imageId', 'amountPaid',
      'purchaseDate', 'points', 'country', 'region', 'coinType', 'currencyType',
      'mint', 'condition'
    ],
    preferenceFields: [
      'isDarkMode', 'themeMode', 'themeTexture', 'sortBy', 'groupBy', 'isGrouped',
      'activeFolderId', 'showBottomMenu', 'isCompactUI', 'isTextMode', 'enableBgRemoval',
      'isPurchaseMode', 'showPriceInNormalMode', 'denominationPrices', 'layoutType',
      'showLayoutSwitcher', 'showOldEuropeanCoins', 'europeanCoinFilter',
      'territoryFilter', 'activeRegion', 'ambientMotion', 'enableImageLibrary',
      'enabledLayouts', 'visibleFields', 'scrollOrientation'
    ],
    requiredCoinFields: ['id', 'title', 'denomination', 'year', 'isCollected', 'addedAt']
  },
  '2.5': {
    version: '2.5',
    coinFields: [
      'id', 'title', 'denomination', 'year', 'summary', 'isCollected', 'isRare',
      'category', 'folderId', 'addedAt', 'imageUrl', 'imageId', 'amountPaid',
      'purchaseDate', 'points', 'country', 'currencyType', 'mint', 'condition'
    ],
    preferenceFields: [
      'isDarkMode', 'themeMode', 'themeTexture', 'sortBy', 'groupBy', 'isGrouped',
      'activeFolderId', 'showBottomMenu', 'isCompactUI', 'isTextMode', 'enableBgRemoval',
      'isPurchaseMode', 'showPriceInNormalMode', 'denominationPrices', 'layoutType',
      'showLayoutSwitcher', 'showOldEuropeanCoins', 'europeanCoinFilter',
      'ambientMotion', 'enableImageLibrary', 'enabledLayouts', 'visibleFields'
    ],
    requiredCoinFields: ['id', 'title', 'denomination', 'year', 'isCollected', 'addedAt']
  },
  '2.0': {
    version: '2.0',
    coinFields: [
      'id', 'title', 'denomination', 'year', 'summary', 'isCollected', 'isRare',
      'category', 'folderId', 'addedAt', 'imageUrl', 'imageId', 'mint', 'condition'
    ],
    preferenceFields: [
      'isDarkMode', 'themeMode', 'themeTexture', 'sortBy', 'groupBy', 'isGrouped',
      'activeFolderId', 'showBottomMenu', 'isCompactUI', 'isTextMode', 'enableBgRemoval',
      'layoutType', 'enabledLayouts', 'visibleFields'
    ],
    requiredCoinFields: ['id', 'title', 'denomination', 'year', 'isCollected', 'addedAt']
  }
};

const filterFields = (obj: any, allowedFields: string[]) => {
  if (!obj || typeof obj !== 'object') return obj;
  const newObj: any = {};
  allowedFields.forEach(field => {
    if (field in obj) {
      newObj[field] = obj[field];
    }
  });
  return newObj;
};

const v3ToV25 = (data: any) => {
  const schema = SCHEMAS['2.5'];
  return {
    ...data,
    version: 2.5,
    appVersion: '2.5',
    coins: (data.coins || []).map((coin: any) => filterFields(coin, schema.coinFields)),
    preferences: filterFields(data.preferences, schema.preferenceFields)
  };
};

const v25ToV20 = (data: any) => {
  const schema = SCHEMAS['2.0'];
  return {
    ...data,
    version: 2.0,
    appVersion: '2.0',
    coins: (data.coins || []).map((coin: any) => filterFields(coin, schema.coinFields)),
    preferences: filterFields(data.preferences, schema.preferenceFields)
  };
};

export const convertToVersion = (data: any, targetVersion: AppVersion): any => {
  let currentData = JSON.parse(JSON.stringify(data));
  let currentVer = parseFloat(currentData.version || currentData.appVersion || '3.0');
  const targetVer = parseFloat(targetVersion);

  if (currentVer === targetVer) {
    currentData.appVersion = targetVersion;
    currentData.version = targetVer;
    return currentData;
  }

  // Downgrade path
  if (currentVer > targetVer) {
    if (currentVer >= 3.0 && targetVer <= 2.5) {
      currentData = v3ToV25(currentData);
      currentVer = 2.5;
    }
    if (currentVer >= 2.5 && targetVer <= 2.0) {
      currentData = v25ToV20(currentData);
      currentVer = 2.0;
    }
  }
  
  // Ensure version markers are set
  currentData.appVersion = targetVersion;
  currentData.version = targetVer;

  return currentData;
};
