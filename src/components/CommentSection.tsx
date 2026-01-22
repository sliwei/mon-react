import type { FC, ReactNode } from 'react';

import type { Comment as BiliComment } from '../types';
import dayjs from 'dayjs';
import { CheckCircle } from 'lucide-react';

// B站表情静态映射表
const EMOTE_MAP: Record<string, string> = {
  "[doge_金箍]": "https://i1.hdslb.com/bfs/emote/aadaca1895e09c5596fc6365192ec93a23718cf0.png",
  "[笑哭]": "https://i1.hdslb.com/bfs/emote/c3043ba94babf824dea03ce500d0e73763bf4f40.png",
  "[蹲蹲]": "https://i1.hdslb.com/bfs/emote/878f1dfac79622050f730d1fee5f7b1a55951c74.png",
  "[星星眼]": "https://i1.hdslb.com/bfs/emote/63c9d1a31c0da745b61cdb35e0ecb28635675db2.png",
  "[微笑]": "https://i1.hdslb.com/bfs/emote/685612eadc33f6bc233776c6241813385844f182.png",
  "[吃瓜]": "https://i1.hdslb.com/bfs/emote/4191ce3c44c2b3df8fd97c33f85d3ab15f4f3c84.png",
  "[打call]": "https://i1.hdslb.com/bfs/emote/431432c43da3ee5aab5b0e4f8931953e649e9975.png",
  "[OK]": "https://i1.hdslb.com/bfs/emote/4683fd9ffc925fa6423110979d7dcac5eda297f4.png",
  "[doge]": "https://i1.hdslb.com/bfs/emote/3087d273a78ccaff4bb1e9972e2ba2a7583c9f11.png",
  "[大哭]": "https://i1.hdslb.com/bfs/emote/2caafee2e5db4db72104650d87810cc2c123fc86.png",
  "[辣眼睛]": "https://i1.hdslb.com/bfs/emote/35d62c496d1e4ea9e091243fa812866f5fecc101.png",
  "[滑稽]": "https://i1.hdslb.com/bfs/emote/d15121545a99ac46774f1f4465b895fe2d1411c3.png",
  "[喜极而泣]": "https://i1.hdslb.com/bfs/emote/485a7e0c01c2d70707daae53bee4a9e2e31ef1ed.png",
  "[呲牙]": "https://i1.hdslb.com/bfs/emote/b5a5898491944a4268360f2e7a84623149672eb6.png",
  "[歪嘴]": "https://i1.hdslb.com/bfs/emote/4384050fbab0586259acdd170b510fe262f08a17.png",
  "[调皮]": "https://i1.hdslb.com/bfs/emote/8290b7308325e3179d2154327c85640af1528617.png",
  "[妙啊]": "https://i1.hdslb.com/bfs/emote/b4cb77159d58614a9b787b91b1cd22a81f383535.png",
  "[嗑瓜子]": "https://i1.hdslb.com/bfs/emote/28a91da1685d90124cfeead74622e1ebb417c0eb.png",
  "[藏狐]": "https://i1.hdslb.com/bfs/emote/ba0937ef6f3ccca85e2e0047e6263f3b4da37201.png",
  "[脱单doge]": "https://i1.hdslb.com/bfs/emote/bf7e00ecab02171f8461ee8cf439c73db9797748.png",
  "[笑]": "https://i1.hdslb.com/bfs/emote/81edf17314cea3b48674312b4364df44d5c01f17.png",
  "[给心心]": "https://i1.hdslb.com/bfs/emote/1597302b98827463f5b75c7cac1f29ea6ce572c4.png",
  "[脸红]": "https://i1.hdslb.com/bfs/emote/0922c375da40e6b69002bd89b858572f424dcfca.png",
  "[嘟嘟]": "https://i1.hdslb.com/bfs/emote/abd7404537d8162720ccbba9e0a8cdf75547e07a.png",
  "[哦呼]": "https://i1.hdslb.com/bfs/emote/362bded07ea5434886271d23fa25f5d85d8af06c.png",
  "[喜欢]": "https://i1.hdslb.com/bfs/emote/8a10a4d73a89f665feff3d46ca56e83dc68f9eb8.png",
  "[酸了]": "https://i1.hdslb.com/bfs/emote/92b1c8cbceea3ae0e8e32253ea414783e8ba7806.png",
  "[害羞]": "https://i1.hdslb.com/bfs/emote/9d2ec4e1fbd6cb1b4d12d2bbbdd124ccb83ddfda.png",
  "[嫌弃]": "https://i1.hdslb.com/bfs/emote/de4c0783aaa60ec03de0a2b90858927bfad7154b.png",
  "[疑惑]": "https://i1.hdslb.com/bfs/emote/b7840db4b1f9f4726b7cb23c0972720c1698d661.png",
  "[偷笑]": "https://i1.hdslb.com/bfs/emote/6c49d226e76c42cd8002abc47b3112bc5a92f66a.png",
  "[惊讶]": "https://i1.hdslb.com/bfs/emote/f8e9a59cad52ae1a19622805696a35f0a0d853f3.png",
  "[捂脸]": "https://i1.hdslb.com/bfs/emote/6921bb43f0c634870b92f4a8ad41dada94a5296d.png",
  "[阴险]": "https://i1.hdslb.com/bfs/emote/ba8d5f8e7d136d59aab52c40fd3b8a43419eb03c.png",
  "[呆]": "https://i1.hdslb.com/bfs/emote/33ad6000d9f9f168a0976bc60937786f239e5d8c.png",
  "[抠鼻]": "https://i1.hdslb.com/bfs/emote/cb89184c97e3f6bc233776c6241813385844f182.png",
  "[大笑]": "https://i1.hdslb.com/bfs/emote/ca94ad1c7e6dac895eb5b33b7836b634c614d1c0.png",
  "[惊喜]": "https://i1.hdslb.com/bfs/emote/0afecaf3a3499479af946f29749e1a6c285b6f65.png",
  "[点赞]": "https://i1.hdslb.com/bfs/emote/1a67265993913f4c35d15a6028a30724e83e7d35.png",
  "[无语]": "https://i1.hdslb.com/bfs/emote/44667b7d9349957e903b1b62cb91fb9b13720f04.png",
  "[鼓掌]": "https://i1.hdslb.com/bfs/emote/895d1fc616b4b6c830cf96012880818c0e1de00d.png",
  "[尴尬]": "https://i1.hdslb.com/bfs/emote/cb321684ed5ce6eacdc2699092ab8fe7679e4fda.png",
  "[灵魂出窍]": "https://i1.hdslb.com/bfs/emote/43d3db7d97343c01b47e22cfabeca84b4251f35a.png",
  "[傲娇]": "https://i1.hdslb.com/bfs/emote/010540d0f61220a0db4922e4a679a1d8eca94f4e.png",
  "[委屈]": "https://i1.hdslb.com/bfs/emote/d2f26cbdd6c96960320af03f5514c5b524990840.png",
  "[疼]": "https://i1.hdslb.com/bfs/emote/905fd9a99ec316e353b9bd4ecd49a5f0a301eabf.png",
  "[冷]": "https://i1.hdslb.com/bfs/emote/cb0ebbd0668640f07ebfc0e03f7a18a8cd00b4ed.png",
  "[热]": "https://i1.hdslb.com/bfs/emote/4e58a2a6f5f1580ac33df2d2cf7ecad7d9ab3635.png",
  "[生病]": "https://i1.hdslb.com/bfs/emote/0f25ce04ae1d7baf98650986454c634f6612cb76.png",
  "[生气]": "https://i1.hdslb.com/bfs/emote/3195714219c4b582a4fb02033dd1519913d0246d.png",
  "[捂眼]": "https://i1.hdslb.com/bfs/emote/c5c6d6982e1e53e478daae554b239f2b227b172b.png",
  "[嘘声]": "https://i1.hdslb.com/bfs/emote/e64af664d20716e090f10411496998095f62f844.png",
  "[思考]": "https://i1.hdslb.com/bfs/emote/cfa9b7e89e4bfe04bbcd34ccb1b0df37f4fa905c.png",
  "[再见]": "https://i1.hdslb.com/bfs/emote/fc510306bae26c9aec7e287cdf201ded27b065b9.png",
  "[翻白眼]": "https://i1.hdslb.com/bfs/emote/eba54707c7168925b18f6f8b1f48d532fe08c2b1.png",
  "[抓狂]": "https://i1.hdslb.com/bfs/emote/4c87afff88c22439c45b79e9d2035d21d5622eba.png",
  "[哈欠]": "https://i1.hdslb.com/bfs/emote/888d877729cbec444ddbd1cf4c9af155a7a06086.png",
  "[奋斗]": "https://i1.hdslb.com/bfs/emote/bb2060c15dba7d3fd731c35079d1617f1afe3376.png",
  "[墨镜]": "https://i1.hdslb.com/bfs/emote/3a03aebfc06339d86a68c2d893303b46f4b85771.png",
  "[难过]": "https://i1.hdslb.com/bfs/emote/a651db36701610aa70a781fa98c07c9789b11543.png",
  "[口罩]": "https://i1.hdslb.com/bfs/emote/3ad2f66b151496d2a5fb0a8ea75f32265d778dd3.png",
  "[撇嘴]": "https://i1.hdslb.com/bfs/emote/531863568e5668c5ac181d395508a0eeb1f0cda4.png",
  "[黑眼圈_金箍]": "https://i1.hdslb.com/bfs/emote/3d8edacc6efa4bc397642ee2bdc688c2eb976b4f.png",
  "[猴哥]": "https://i1.hdslb.com/bfs/emote/4dae851bd07b91418824ba3897659b7b9017114d.png",
  "[鸭科夫_流汗鸭]": "https://i1.hdslb.com/bfs/emote/b49b325224cef1ef8313728022aa86e93e65bd08.png",
  "[鸭科夫_干嘛鸭]": "https://i1.hdslb.com/bfs/emote/2e67293d703e6501d7a639870477cbcc16277a23.png",
  "[鸭科夫_红温鸭]": "https://i1.hdslb.com/bfs/emote/3ff2737eb4d78fba74f37276d99755ee5df621b8.png",
  "[黑猫]": "https://i1.hdslb.com/bfs/emote/6bd61d4f5c29c17098f31dfb6ce2140dd2b728a8.png",
  "[三花猫]": "https://i1.hdslb.com/bfs/emote/3a36c1f88956996b31a835c13041f4d505f2e2e0.png",
  "[折耳猫]": "https://i1.hdslb.com/bfs/emote/4a09dc958bdd82391ba97af0d09dab0925c5b46c.png",
  "[银魂_justaway]": "https://i1.hdslb.com/bfs/emote/7ef3eecc6b69404524e86b5f48d94c02ab0a9b34.png",
  "[我独自升级_疑惑]": "https://i1.hdslb.com/bfs/emote/6cac4bce69f120e04c44f09bcd624c8dcd5675fa.png",
  "[怪兽8号_奇可露]": "https://i1.hdslb.com/bfs/emote/694a2bc638d2242e379d802715d29536357f9d36.png",
  "[颂乐人偶_眯眼笑]": "https://i1.hdslb.com/bfs/emote/6087f6b3919b915c8922e608cfde147dd5ece43b.png",
  "[坂本_佛系]": "https://i1.hdslb.com/bfs/emote/89c70d9044637a66fceaf99d89b257984117ce36.png",
  "[生气_金箍]": "https://i1.hdslb.com/bfs/emote/fb3fbcf44157a5ba460b62341a86b38c11e7a664.png",
  "[龙年]": "https://i1.hdslb.com/bfs/emote/7d0e1e48a56a6b739bcbb4f602fe555082d64ed7.png",
  "[豹富]": "https://i1.hdslb.com/bfs/emote/3d1dbe52ea16e12ff7b1c371196f728a4097fb33.png",
  "[兔兔岛_开心]": "https://i1.hdslb.com/bfs/emote/40dabdb3237a9d8c726f663360d7e967eac3ac01.png",
  "[兔兔岛_吃面]": "https://i1.hdslb.com/bfs/emote/7277d90e321bf4407377ff18cc0bfcde106234d9.png",
  "[兔兔岛_睡觉]": "https://i1.hdslb.com/bfs/emote/c272aa0e59e2e20432e54fa229b15652f2593308.png",
  "[重返未来1999_喂]": "https://i1.hdslb.com/bfs/emote/4e224148584938588a0d500eea8127db21f06ebb.png",
  "[重返未来1999_赞]": "https://i1.hdslb.com/bfs/emote/e250228e3ba06822496dc2ff81e49324298f8bc8.png",
  "[重返未来1999_谢谢老板]": "https://i1.hdslb.com/bfs/emote/d87d32fd4c91f1045842362c328e8f359dab4fd6.png",
  "[重返未来1999_什么]": "https://i1.hdslb.com/bfs/emote/8f1a9abbe5364a110aba1bde276d1f2712108edc.png",
  "[胆大党_微笑]": "https://i1.hdslb.com/bfs/emote/24d13e3f1713d854f93416ac11b3c5ceb4f0120f.png",
  "[水稻]": "https://i1.hdslb.com/bfs/emote/d530fcaa5100ba12a17a79b55bad342d530c54e3.png",
  "[奶茶干杯]": "https://i1.hdslb.com/bfs/emote/d5a491990be551ce69f9660da948050df4eab331.png",
  "[汤圆]": "https://i1.hdslb.com/bfs/emote/93609633a9d194cf336687eb19c01dca95bde719.png",
  "[锦鲤]": "https://i1.hdslb.com/bfs/emote/643d6c19c8164ffd89e3e9cdf093cf5d773d979c.png",
  "[福到了]": "https://i1.hdslb.com/bfs/emote/5de5373d354c373cf1617b6b836f3a8d53c5a655.png",
  "[鸡腿]": "https://i1.hdslb.com/bfs/emote/c7860392815d345fa69c4f00ef18d67dccfbd574.png",
  "[雪花]": "https://i1.hdslb.com/bfs/emote/a41813c4edf8782047e172c884ebd4507ce5e449.png",
  "[视频卫星]": "https://i1.hdslb.com/bfs/emote/dce6fc7d6dfeafff01241924db60f8251cca5307.png",
  "[干杯]": "https://i1.hdslb.com/bfs/emote/8da12d5f55a2c7e9778dcc05b40571979fe208e6.png",
  "[黑洞]": "https://i1.hdslb.com/bfs/emote/c4e9f0e3f35961d5037cb071b16ddba2170b262c.png",
  "[爱心]": "https://i1.hdslb.com/bfs/emote/ed04066ea7124106d17ffcaf75600700e5442f5c.png",
  "[胜利]": "https://i1.hdslb.com/bfs/emote/b49fa9f4b1e7c3477918153b82c60b114d87347c.png",
  "[加油]": "https://i1.hdslb.com/bfs/emote/c7aaeacb21e107292d3bb053e5abde4a4459ed30.png",
  "[抱拳]": "https://i1.hdslb.com/bfs/emote/89516218158dbea18ab78e8873060bf95d33bbbe.png",
  "[响指]": "https://i1.hdslb.com/bfs/emote/1b5c53cf14336903e1d2ae3527ca380a1256a077.png",
  "[保佑]": "https://i1.hdslb.com/bfs/emote/fafe8d3de0dc139ebe995491d2dac458a865fb30.png",
  "[福]": "https://i1.hdslb.com/bfs/emote/802429a301ac5b35a0480d9526a070ce67cd8097.png",
  "[支持]": "https://i1.hdslb.com/bfs/emote/3c210366a5585706c09d4c686a9d942b39feeb50.png",
  "[拥抱]": "https://i1.hdslb.com/bfs/emote/41780a4254750cdaaccb20735730a36044e98ef3.png",
  "[跪了]": "https://i1.hdslb.com/bfs/emote/f2b3aee7e521de7799d4e3aa379b01be032698ac.png",
  "[怪我咯]": "https://i1.hdslb.com/bfs/emote/07cc6077f7f7d75b8d2c722dd9d9828a9fb9e46d.png",
  "[香格里拉边境]": "https://i1.hdslb.com/bfs/emote/80e53d32b4abd12232126f03c68de7c1a67a1e9f.png",
  "[老鼠]": "https://i1.hdslb.com/bfs/emote/8e6fb491eb1bb0d5862e7ec8ccf9a3da12b6c155.png",
  "[牛年]": "https://i1.hdslb.com/bfs/emote/9275275ff1f2659310648221107d20bc4970f106.png",
  "[兔年]": "https://i1.hdslb.com/bfs/emote/9cb6ee2c42986c56ec361d21d5ccbd096aefab0a.png",
  "[三星堆]": "https://i1.hdslb.com/bfs/emote/fc7dadaa6986e75b813aa26f3eff3281d5f1a6d1.png",
  "[桃源_给花花]": "https://i1.hdslb.com/bfs/emote/085d41d0fa25453b58fdc87dc2df538183fea11e.png",
  "[桃源_缘分]": "https://i1.hdslb.com/bfs/emote/cf1c441507689342713623965035f9bed72b1b17.png",
  "[桃源_傲娇]": "https://i1.hdslb.com/bfs/emote/ce8314c9c2cfdbe235c239c28b819698e29a02d3.png",
  "[桃源_欢呼]": "https://i1.hdslb.com/bfs/emote/1f439878d8160bd64a4464904064a10df880c921.png",
  "[桃源_乖巧]": "https://i1.hdslb.com/bfs/emote/57d087b6437002c2ca9e225dcac0ef226d1f2654.png",
  "[鸣潮_好呀]": "https://i1.hdslb.com/bfs/emote/b500f106c3be1d61e110e6f1cfaafc5c2311ed37.png",
  "[鸣潮_唉]": "https://i1.hdslb.com/bfs/emote/8b1a0c279d23f9c1a947c96ffc658d848650a773.png",
  "[鸣潮_咦]": "https://i1.hdslb.com/bfs/emote/866390294acb5e6cf6017e3f88acffa21d9130bb.png",
  "[鸣潮_嘿]": "https://i1.hdslb.com/bfs/emote/0cf0a8c8e1f32b9d4144a25c43e972580a7a631f.png",
  "[鸣潮_哇]": "https://i1.hdslb.com/bfs/emote/759651f8e616075c9494160d2541ed581c55550a.png",
  "[鸣潮_嗯]": "https://i1.hdslb.com/bfs/emote/441b5da4fdf295728f859f9388d528a79f3367bc.png",
  "[鸣潮_嗨]": "https://i1.hdslb.com/bfs/emote/2589293ba4ba4e60e65569a079819a8578c48378.png",
  "[鸣潮_祈愿]": "https://i1.hdslb.com/bfs/emote/8ec500d5820f43852d272349cc32927084628376.png",
  "[鸣潮_你好]": "https://i1.hdslb.com/bfs/emote/06a9869adc94651e62e1579527d051243dfabcf7.png",
  "[鸣潮_嘿嘿]": "https://i1.hdslb.com/bfs/emote/177eeb8dc85f38ff3d150ab6bb09f431e4e394e5.png",
  "[洛天依]": "https://i1.hdslb.com/bfs/emote/9fe06f3594d9afaf4ee2b74770f1c3086ae0ba11.png",
  "[少女乐团派对_派对]": "https://i1.hdslb.com/bfs/emote/b3ea2c80fdd3b4db112c659e08416f987467d4b9.png",
  "[少女乐团派对_等一下]": "https://i1.hdslb.com/bfs/emote/bebd886bed3c4d5ded63728eb1e06d0fce0cae8f.png",
  "[少女乐团派对_期待]": "https://i1.hdslb.com/bfs/emote/da237793f08eab3acd7b811e33ae5aad672a8b0a.png",
  "[少女乐团派对_感想]": "https://i1.hdslb.com/bfs/emote/6d40f35734f2cea4f081455b9a9560951aa88ee7.png",
  "[少女乐团派对_开心]": "https://i1.hdslb.com/bfs/emote/1815b2e21a0379ba3d052942ae7314326e0d8272.png",
  "[少女乐团派对_哇哦]": "https://i1.hdslb.com/bfs/emote/afc0f71bf9a65b1d929f5bd3ebd77cd725e3226e.png",
  "[怪兽8号_开心]": "https://i1.hdslb.com/bfs/emote/10ff5a4eba58e8d99fa3d5f21c98f10c3b61cc5f.png",
  "[白荆回廊_欢呼]": "https://i1.hdslb.com/bfs/emote/c326324f72047d4041760bc8cf3eb90003b36bd4.png",
  "[白荆回廊_期待]": "https://i1.hdslb.com/bfs/emote/9581d1386ce9498e456b39268fdb7b51023bf76a.png",
  "[白荆回廊_啊？]": "https://i1.hdslb.com/bfs/emote/275a1580ddc2f581d65d3cb647eb92d9abb7788b.png",
  "[白荆回廊_好好好]": "https://i1.hdslb.com/bfs/emote/a1e2fac2355569c2c1348a69333f76e8f6dfbd6b.png",
  "[白荆回廊_无语]": "https://i1.hdslb.com/bfs/emote/b85bca2e51f8ad03478c36222cdc6c266a04d9a5.png",
  "[白荆回廊_尴尬]": "https://i1.hdslb.com/bfs/emote/5f42aa8c1f13126f9dd7554a3b91db9068c6b2fa.png",
  "[坎公骑冠剑_吃鸡]": "https://i1.hdslb.com/bfs/emote/c4248a7b6ab326d66c83fd1fb58f1a50f99df332.png",
  "[坎公骑冠剑_钻石]": "https://i1.hdslb.com/bfs/emote/0b97c7e50e0cc963370e62fbb9b55f51bbe7f8ab.png",
  "[坎公骑冠剑_无语]": "https://i1.hdslb.com/bfs/emote/80eba0ce64c3fc1279b4daede2f1979cb2380e78.png",
  "[来古-疑问]": "https://i1.hdslb.com/bfs/emote/032fdc0d9d9fe6334776f6c39518a959b73b98f4.png",
  "[来古-沉思]": "https://i1.hdslb.com/bfs/emote/4ee07ff03266d62b246be0b950bebb2abf3d997c.png",
  "[来古-呆滞]": "https://i1.hdslb.com/bfs/emote/9a70b365e523f2379f395031ceefcebb75a45903.png",
  "[来古-震撼]": "https://i1.hdslb.com/bfs/emote/8b40f228675602a317d32007de6b795c101135ec.png",
  "[来古-注意]": "https://i1.hdslb.com/bfs/emote/4b671ba32a2581cf40e5cd41c67b111eb8010de0.png",
  "[FGO_耶]": "https://i1.hdslb.com/bfs/emote/cb57c18365601d277e5a5d52b0957616d034f04c.png",
  "[FGO_开心]": "https://i1.hdslb.com/bfs/emote/300dadb9ec3cf14cf5ed55e2542947fe6e4f0295.png",
  "[FGO_汗]": "https://i1.hdslb.com/bfs/emote/93d8a770a22914ade2354ca928bb1799b2260d00.png",
  "[FGO_怒]": "https://i1.hdslb.com/bfs/emote/75ee235f331b3c714e1cfb264fff9e562b20944b.png",
  "[FGO_偷看]": "https://i1.hdslb.com/bfs/emote/b2d752b135b72a93c13b26bb0e272070a906257b.png",
  "[FGO_点赞]": "https://i1.hdslb.com/bfs/emote/bd43daa7e0fcd07bae5eedcc7e9f5e0b7f528514.png",
  "[FGO_干饭]": "https://i1.hdslb.com/bfs/emote/4e415a5da552265b01264321a7609982b4e8778f.png",
  "[FGO_加油]": "https://i1.hdslb.com/bfs/emote/1ac3d29dda3660d0f4e4be4ac3478cd01e5e4502.png",
  "[FGO_困]": "https://i1.hdslb.com/bfs/emote/760a0f88213b2a27e1c566dd9cd6eff64984285a.png",
  "[FGO_燃尽]": "https://i1.hdslb.com/bfs/emote/ec452d2a6caa86333e9d0bbf1badd3d554128b4e.png",
  "[FGO_wink]": "https://i1.hdslb.com/bfs/emote/2faa79d03fe40dba69b014d1908efb94780700a9.png",
  "[初音未来_大笑]": "https://i1.hdslb.com/bfs/emote/8e7f71cda83ce407b0684702983399f8ed982f17.png",
  "[原神_哇]": "https://i1.hdslb.com/bfs/emote/8188ddf95bace929d382c7a83214afde79d83bfc.png",
  "[原神_哼]": "https://i1.hdslb.com/bfs/emote/91ed33b74bc36873c3ac8b2648f70d7ab6d8ab78.png",
  "[原神_嗯]": "https://i1.hdslb.com/bfs/emote/8b0a87e414f453a29730b6e0f45ca61f2f898688.png",
  "[原神_欸嘿]": "https://i1.hdslb.com/bfs/emote/8fba438fcbe0550877b04efd768d857082307c5e.png",
  "[原神_喝茶]": "https://i1.hdslb.com/bfs/emote/1de5789fbb3526ef7823c54db7081790a38e7044.png",
  "[原神_生气]": "https://i1.hdslb.com/bfs/emote/90a38c34742899f8e84138ed55f56cad3ba611fb.png",
  "[保卫萝卜_白眼]": "https://i1.hdslb.com/bfs/emote/9fce63f38288700bf7be84f3be336cf895ba0902.png",
  "[保卫萝卜_笔芯]": "https://i1.hdslb.com/bfs/emote/5ff2ed5cb71b02010018cc5910ac7052a03769af.png",
  "[保卫萝卜_哭哭]": "https://i1.hdslb.com/bfs/emote/7d249f7c990111d3e2982f7477af15b7eb29cbd9.png",
  "[保卫萝卜_哇]": "https://i1.hdslb.com/bfs/emote/5f2370e561c32d841245f7b1aab2eef43aeb9544.png",
  "[保卫萝卜_问号]": "https://i1.hdslb.com/bfs/emote/41eb93f09fc4a4d0692a310e8a1f85ba60e96060.png",
  "[无悔华夏_不愧是你]": "https://i1.hdslb.com/bfs/emote/c58002c32ee78d45366e126f294cb3149dd64ac2.png",
  "[无悔华夏_吃瓜]": "https://i1.hdslb.com/bfs/emote/273dcff577551bafff4f1eae18561f871e73a6ba.png",
  "[无悔华夏_达咩]": "https://i1.hdslb.com/bfs/emote/cffab383f47bab7f6736ba9c8d6ac098113410d9.png",
  "[无悔华夏_点赞]": "https://i1.hdslb.com/bfs/emote/b0f2e8db405ec667c3e6aaabd7c15155b6ea8710.png",
  "[无悔华夏_好耶]": "https://i1.hdslb.com/bfs/emote/324cd79784aeb37dbf2f47f68bbe8ed5d01f975e.png",
  "[奥比岛_搬砖]": "https://i1.hdslb.com/bfs/emote/1fab697214918d91087373a999cc7ef8040ddf85.png",
  "[奥比岛_点赞]": "https://i1.hdslb.com/bfs/emote/fb0b476fe2ff30cd59385ea7d616627ac114161f.png",
  "[奥比岛_击爪]": "https://i1.hdslb.com/bfs/emote/35bba1bb8f164c5e844155548438248e6eaa8382.png",
  "[奥比岛_委屈]": "https://i1.hdslb.com/bfs/emote/fda155e7c33b40dbb94c24644e0635d47b6ef3cc.png",
  "[奥比岛_喜欢]": "https://i1.hdslb.com/bfs/emote/ed64e0c81ee194138bd9df30c65077ed978fb88c.png",
  "[黎明觉醒_怒了鸦]": "https://i1.hdslb.com/bfs/emote/078991ad7546f2fefb79c05894d5f0431736d1e7.png",
  "[黎明觉醒_石化鸦]": "https://i1.hdslb.com/bfs/emote/40bc09683e3b93390995b9ea5dc64f982b34e347.png",
  "[黎明觉醒_摊手鸦]": "https://i1.hdslb.com/bfs/emote/883e4caa8e1745f48de0671c6441810faa4a56ed.png",
  "[黎明觉醒_比心鸦]": "https://i1.hdslb.com/bfs/emote/e25f5442c5bce2a54b9c757e3032f44398f1a7df.png",
  "[黎明觉醒_哼白眼鸦]": "https://i1.hdslb.com/bfs/emote/36de90dbaffeb32477dffdac612ad69da4e19b76.png",
  "[以闪亮之名_哎？！]": "https://i1.hdslb.com/bfs/emote/5fafe7d9992e12c756da909a545ddb27486987af.png",
  "[以闪亮之名_爱你哦]": "https://i1.hdslb.com/bfs/emote/835c3bff4fc686a78f49db1eb68e4d04c0963195.png",
  "[以闪亮之名_吃瓜]": "https://i1.hdslb.com/bfs/emote/ebfdda8501e48c2434297e4a9f15218aadf07747.png",
  "[以闪亮之名_好耶!]": "https://i1.hdslb.com/bfs/emote/fd0c2bbb806265c468eca83b7a90b0d5fcaa4cec.png",
  "[以闪亮之名_星星眼]": "https://i1.hdslb.com/bfs/emote/a44a291ffe9334712ba130aa3fca0b940f32908d.png",
  "[以闪亮之名_针不戳]": "https://i1.hdslb.com/bfs/emote/cad39e954972bbd93f0a777978b2f77078b8cf4a.png",
  "[元梦_爱你]": "https://i1.hdslb.com/bfs/emote/b80e056748199ad498af8e0a1ec91290bfabdae3.png",
  "[元梦_打call]": "https://i1.hdslb.com/bfs/emote/c8d5dc8044143d2869546aaced5bc967eaa4eb28.png",
  "[元梦_大哭]": "https://i1.hdslb.com/bfs/emote/4905fafba7283ab8dd0c6e5087b245392d7f4e27.png",
  "[元梦_点赞]": "https://i1.hdslb.com/bfs/emote/dd0132e92cfdad3f4d69b016d430b387568651f3.png",
  "[元梦_哭哭]": "https://i1.hdslb.com/bfs/emote/06c2245a0ce59e118da5af8f9b06a141b0cd43cc.png",
  "[无限暖暖_暖暖]": "https://i1.hdslb.com/bfs/emote/71dfc073d05c1672031ad2b8c8404d4b97ae66aa.png",
  "[无限暖暖_大喵]": "https://i1.hdslb.com/bfs/emote/4b924d0245e922834c76d9dcf2448a0c8240fe92.png",
  "[无限暖暖_单品灵]": "https://i1.hdslb.com/bfs/emote/a234e5544a65d237749eed7370de577f6b42b47e.png",
  "[无限暖暖_心愿精灵]": "https://i1.hdslb.com/bfs/emote/8d2c2d9ff36317cd71309bf18db82694f213d13a.png",
  "[无限暖暖_美食家蜜蜂]": "https://i1.hdslb.com/bfs/emote/db6013fd4551a2b3f13ca5f5e1d5c9fd9a44f5eb.png",
  "[无限暖暖_袜袜羊]": "https://i1.hdslb.com/bfs/emote/98c5c2bffb45e7e4f26b7f030afa7ea0e44b0d19.png",
  "[无限暖暖_围兜狸猫]": "https://i1.hdslb.com/bfs/emote/4f7f0b66f202fd57150450df2ee95e10ee5ff3f6.png",
  "[无限暖暖_毛线汪汪]": "https://i1.hdslb.com/bfs/emote/06c38ae541b44aa640e152fb97966ca35442a0d2.png",
};

// 解析评论内容中的表情，将 [表情名] 替换为图片
const parseEmoteContent = (content: string): ReactNode => {
  // 匹配 [xxx] 格式的表情
  const emoteRegex = /\[[^[\]]+\]/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = emoteRegex.exec(content)) !== null) {
    // 添加表情前的普通文本
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const emoteKey = match[0]; // e.g., "[doge]"
    const emoteUrl = EMOTE_MAP[emoteKey];

    if (emoteUrl) {
      // 找到对应的表情，渲染为图片
      parts.push(
        <img
          key={`emote-${keyIndex++}`}
          src={emoteUrl}
          alt={emoteKey}
          title={emoteKey}
          className="inline-block align-middle h-[1.25em] w-auto mx-0.5"
        />
      );
    } else {
      // 没找到表情映射，保留原文本
      parts.push(emoteKey);
    }

    lastIndex = match.index + match[0].length;
  }

  // 添加最后剩余的文本
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
};

interface CommentSectionProps {
  oid: string;
  type: number;
  comments?: BiliComment[];
  upName?: string;
  onMarkRead?: (id: string, isDynamic?: boolean) => void;
  onlyShowUP?: boolean;
}

const CommentItem: FC<{ 
  comment: BiliComment; 
  isSub?: boolean;
  upName?: string;
  onMarkRead?: (id: string, isDynamic?: boolean) => void;
  onlyShowUP?: boolean;
}> = ({ comment, isSub, upName, onMarkRead, onlyShowUP }) => {
  // We rely on pre-fetched replies. 
  // If we want to support "Load More" essentially we need the polling service to fetch deeper,
  // or we treat "Load More" as an exception. 
  // Given the strict "UI does not call API" rule, we will only show what is in `comment.replies`.
  // The polling service attempts to fetch sub-replies.
  
  const allSubReplies = comment.replies || [];
  const subReplies = onlyShowUP 
    ? allSubReplies.filter(r => upName && r.userName === upName)
    : allSubReplies;
  const isUp = upName && comment.userName === upName;
  const isUnread = isUp && !comment.isRead;

  return (
    <div className={`flex ${isSub ? 'mt-2' : 'mt-3'} ${isUnread ? 'bg-primary/5 p-2 rounded-lg border border-primary/20' : ''}`}>
      <img src={comment.userFace} alt={comment.userName} className={`${isSub ? 'w-5 h-5' : 'w-7 h-7'} rounded-full mr-2.5 shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-0.5 items-start">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-semibold ${isSub ? 'text-[0.75rem]' : 'text-[0.8rem]'}`}>{comment.userName}</span>
            {comment.isPinned && (
              <span className="text-[0.65rem] text-primary bg-primary/10 px-1 py-0.5 rounded border border-primary shrink-0">置顶</span>
            )}
            {isUp && (
              <span className="text-[0.65rem] text-white bg-primary px-1 py-0.5 rounded shrink-0">UP</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] text-text-secondary! whitespace-nowrap">
              {dayjs(comment.timestamp * 1000).format('MM-DD HH:mm:ss')}
            </span>
            {isUnread && onMarkRead && (
                <button 
                  onClick={() => onMarkRead(comment.id, false)}
                  className="flex items-center text-[0.65rem] hover:text-primary! hover:bg-primary/10 px-1.5 py-0.5 rounded border border-primary transition-colors cursor-pointer"
                  title="标记为已读"
                >
                  <CheckCircle size={12} className="mr-1" />
                  <span>已读</span>
                </button>
            )}
          </div>
        </div>
        <div className={`text-text-primary leading-snug ${isSub ? 'text-[0.8rem]' : 'text-[0.85rem]'}`}>
          {parseEmoteContent(comment.content)}
        </div>
        
        {subReplies.length > 0 && (
          <div className="mt-1.5">
            {subReplies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                isSub={true} 
                upName={upName}
                onMarkRead={onMarkRead}
                onlyShowUP={onlyShowUP}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection: FC<CommentSectionProps> = ({ comments, upName, onMarkRead, onlyShowUP }) => {
  if (!comments || comments.length === 0) return <div className="p-2 text-[0.75rem] text-text-secondary">暂无评论或数据未更新</div>;
  
  // 过滤评论：只看UP时，只显示UP主的评论或包含UP主回复的评论
  const filteredComments = onlyShowUP 
    ? comments.filter(c => {
        const isUp = upName && c.userName === upName;
        const hasUpReply = c.replies?.some(r => upName && r.userName === upName);
        return isUp || hasUpReply;
      })
    : comments;

  if (onlyShowUP && filteredComments.length === 0) {
    return <div className="p-2 text-[0.75rem] text-text-secondary">该动态下暂无UP主的评论</div>;
  }

  return (
    <div className="px-4 pb-4 border-t border-border bg-black/5 dark:bg-black/10">
      {filteredComments.map(comment => (
        <CommentItem 
            key={comment.id} 
            comment={comment} 
            upName={upName}
            onMarkRead={onMarkRead}
            onlyShowUP={onlyShowUP}
        />
      ))}
    </div>
  );
};

export default CommentSection;
