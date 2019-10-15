import re
import json
import requests

# Run this file in the root directory of project
# e.g. python ./tools/extractMaterials.py

def readJson(path):
    return requests.get("https://raw.githubusercontent.com/Perfare/ArknightsGameData/master"+path).json()
    


skillTbl = readJson("/excel/skill_table.json")
skidToName = {}
for skid in skillTbl:
    skidToName[skid] = skillTbl[skid]['levels'][0]['name']

charTbl = readJson("/excel/character_table.json")
result = {}
profMap = {
    'MEDIC': '医疗',
    'WARRIOR': '近卫',
    "PIONEER": '先锋',
    'TANK': '重装',
    'SNIPER': '狙击',
    'CASTER': '术师',
    'SUPPORT': '辅助',
    'SPECIAL': '特种'
}
for chid in charTbl:
    char = charTbl[chid]
    newCh = {
        'name': char['name'],
        'rarity': char['rarity'],
        'profession': profMap.get(char['profession'], '其它'),
        'evolveCosts': [x['evolveCost'] for x in char['phases']],
        'sskillCosts': [
            {
                'skillName': skidToName[x['skillId']] if x['skillId'] else "",
                'levelUpCost': x['levelUpCostCond'],
                'unlockCond':x['unlockCond']
            } for x in char['skills']],
        'askillCosts': char['allSkillLvlup'],
    }
    result[char['name']] = newCh
    print(char['name'])

with open("./src/assets/data/charMaterials.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False)
