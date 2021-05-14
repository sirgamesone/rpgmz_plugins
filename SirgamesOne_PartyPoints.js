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
// Game_Unit
//=============================================================================


Game_Unit.prototype.partyPoints = function() {
	let totalPartyPoints = 0;
	for (let member of this.aliveMembers()) {
		totalPartyPoints += member.calculatePartyPoints();
	}
	return totalPartyPoints;
}



SirgamesOne.PartyPoints._initialize();