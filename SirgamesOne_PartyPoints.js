//=============================================================================
// SirgamesOne Plugins - RPG Maker MZ - Party Points
// SirgamesOne_PartyPoints.js 1.0
//=============================================================================

var SirgamesOne = SirgamesOne || {};
SirgamesOne.PartyPoints = SirgamesOne.PartyPoints || {};
SirgamesOne.PartyPoints.version = 1.0;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc v1.0 count points for each Game Unit (allies and troops) based different status
 * @author SirgamesOne
 *
 *
 * @param Party Points Award List
 * @type struct<PartyPointAward>[]
 * @desc list of ways to get Party points
 * @default []
 *
 * @param Party Points Name
 * @Type string
 * @default Party Points
 *
 * @param Party Points Name Abbreviation
 * @Type string
 * @default PP
 */


  /*~struct~PartyPointAward:
 * @param Status List
 * @desc The list of all status that a member must have to get party points
 * @type state[]
 *
 * @param Points
 * @type number
 * @min 1
 * @max 99
 * @default 1
 * @desc the number of party points gained
 */


/* Knowed Bugs:
 * scompare se si seleziona options dal menu
 * I party points non si aggiornano per i nemici allo start della action (altrimenti gli conta il guard del turno precedente nei PP)
 *
 * TODOs:
 * Aggiungere icona status da opzioni del plugin
 * aggiungere opzioni di target se PP party > PP nemici
 * Integrare con la funzione di targets
 */

//=============================================================================
// Initialize (called at the start of the game)
//=============================================================================
SirgamesOne.PartyPoints._initialize = function() {
	SirgamesOne.PartyPoints.statusGroupList = [];
	SirgamesOne.PartyPoints.pointList = [];

	SirgamesOne.PartyPoints.Parameters = PluginManager.parameters('SirgamesOne_PartyPoints');
	SirgamesOne.PartyPoints.Parameters['Party Points Award List'] = JSON.parse(SirgamesOne.PartyPoints.Parameters['Party Points Award List']);
	SirgamesOne.PartyPoints.Parameters['Party Points Award List'] = SirgamesOne.PartyPoints.Parameters['Party Points Award List']
		.map(partyPointAward => JSON.parse(partyPointAward))
		.map(partyPointAward => {
			var obj = partyPointAward;
			obj["Status List"] = JSON.parse(partyPointAward["Status List"]).map(status => Number(status));
			obj["Points"] = JSON.parse(partyPointAward["Points"]);

			SirgamesOne.PartyPoints.statusGroupList.push(obj["Status List"]);
			SirgamesOne.PartyPoints.pointList.push(obj["Points"]);
			return obj;
		});
}

SirgamesOne.PartyPoints._initialize();


// update solo se currentValue != lastValue
SirgamesOne.PartyPoints.update = function() {
	const partyPointsAllies = $gameParty.partyPoints();
	const partyPointsEnemies = $gameTroop.partyPoints();

	if (this.partyPointsAllies == null || this.partyPointsAllies != partyPointsAllies) {
		this.partyPointsAllies = partyPointsAllies;
		this._updateAlliesPartyPointsWindow(partyPointsAllies);
	}

	if (this.partyPointsEnemies == null || this.partyPointsEnemies != partyPointsEnemies) {
		this.partyPointsEnemies = partyPointsEnemies;
		this._updateEnemiesPartyPointsWindow(partyPointsEnemies);
	}
}

//=============================================================================
// Game_Battler
//=============================================================================
Game_Battler.prototype.calculatePartyPoints = function() {
	let resultPoints = 0;
	for (let i = 0; i < SirgamesOne.PartyPoints.statusGroupList.length; i++) {
		let statusList = SirgamesOne.PartyPoints.statusGroupList[i];
		let points = SirgamesOne.PartyPoints.pointList[i];
		if (statusList.every(statusId => this.states().map(state => state.id).includes(statusId))) {
			resultPoints += points;
		}
	}

	return resultPoints;
}

//=============================================================================
// Game_Unit - Calculate party points for the game unit
//=============================================================================
Game_Unit.prototype.partyPoints = function() {
	let totalPartyPoints = 0;
	for (let member of this.aliveMembers()) {
		totalPartyPoints += member.calculatePartyPoints();
	}
	return totalPartyPoints;
}



//=============================================================================
// ** Spriteset_Battle - Draw Party points in battle
//=============================================================================	

var _sirgamesone_partyPoints_createUpperLayer = Spriteset_Battle.prototype.createUpperLayer;
Spriteset_Battle.prototype.createUpperLayer = function() {
	this.createPartyPointsSprites();
	_sirgamesone_partyPoints_createUpperLayer.call(this);	
};

Spriteset_Battle.prototype.createPartyPointsSprites = function() {

	const boxWidth = Graphics.boxWidth;

	SirgamesOne.PartyPoints.windowAlliesPartyPoints = new Window_Base(new Rectangle(boxWidth - boxWidth / 4, 25, ImageManager.iconWidth+22, ImageManager.iconHeight+22));
	SirgamesOne.PartyPoints.windowEnemiesPartyPoints = new Window_Base(new Rectangle(boxWidth / 4, 25, ImageManager.iconWidth+22, ImageManager.iconHeight+22));


	SirgamesOne.PartyPoints.update();

	this._battleField.addChild(SirgamesOne.PartyPoints.windowAlliesPartyPoints);	
	this._battleField.addChild(SirgamesOne.PartyPoints.windowEnemiesPartyPoints);
}


SirgamesOne.PartyPoints._updateAlliesPartyPointsWindow = function(points) {
	this.windowAlliesPartyPoints.destroyContents();
	this.windowAlliesPartyPoints.createContents();
	this.windowAlliesPartyPoints.drawIcon(81, 0, 0);
	this.windowAlliesPartyPoints.drawText(points, 0, 0, 33, 22, "center");
}

SirgamesOne.PartyPoints._updateEnemiesPartyPointsWindow = function(points) {
	this.windowEnemiesPartyPoints.destroyContents();
	this.windowEnemiesPartyPoints.createContents();
	this.windowEnemiesPartyPoints.drawIcon(81, 0, 0);
	this.windowEnemiesPartyPoints.drawText(points, 0, 0, 33, 22, "center");
}


//=============================================================================
// ** BattleManager
//=============================================================================	


var _sirgamesone_partyPoints_battleManager_startTurn = BattleManager.startActorInput;
BattleManager.startActorInput = function() {
	_sirgamesone_partyPoints_battleManager_startTurn.call(this);
	SirgamesOne.PartyPoints.update();
}


var _sirgamesone_partyPoints_battleManager_endAction = BattleManager.endAction;
BattleManager.endAction = function() {
	_sirgamesone_partyPoints_battleManager_endAction.call(this);
	SirgamesOne.PartyPoints.update();
}



