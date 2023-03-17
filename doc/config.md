# Natrium Config

## Server config
file: config/serverconf.json

## Main config
file: config/main.json

## Game configs
path config/game/

### Map config
file: config/game/map.json

- maps: map config node
  - id: map id, port city map id range:[1-999], other map id : > 1000
  - portid: port id which map belong to 
  - name: map name
  - width: map width in pixel
  - height: map height in pixel
  - bornpos: map born positions array
    - x: x position in pixel
    - y: y position in pixel
    - radius: random range in pixel
  - gotopos: change map entrance map, key: to map id
    - x: entrance x position in pixel
    - y: entrance y position in pixel
    - tox: target map position in pixel
    - toy: target map position in pixel
    - radius: entrance range
  - portto: port link
    - x: port x positoin in pixel 
    - y: port y positoin in pixel 
    - radius: port range
    - toports: linked other port id array
  - npcs: in map npc map, key: npc name
    - name: npc name
    - pos: npc position in pixel

### Mine config
file: config/game/mine.json

- map: per map mine config map, key: map id
  - map mine map, key : mine id
    - x: mine position in pixel
    - y: mine position in pixel
    - type: mine type, ["wood", "iron", "food", ...]
    - maxminner: max miner minning in same time
    - maxoutputcount: when output count go 0, the mine neede wait to recover
    - recovertm: in second, how long will it take to recover
    - outputid: id refer to an output set, mine act will generate item according to {mine_output} setting each time, see in drop config
  
### Drop config
file: config/game/drop.json

- mine_output: mine output setting map, key: output id
  - output item array
    - rate: output probability = rate/(sum rate in all output item in array)
    - itemid: output item id
    - count_min/count_max: each time output, will generate item in the [min, max] range

### Item config
file: config/game/item.json

- goods: goods map, key: item id, range:>1000000
  - name: goods name
  - type: goods type, ["commodity", "product", ...]
  - repoload: weight load of single product
- inventory: inventory map, key: item id, range:[1, 999999] 
  - name: inventory name
  - type: inventory type, ["parts", ...]