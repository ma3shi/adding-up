'use strict';

//参考：https://naokeyzmt.com/blog/programming-file-io-line/
//require関数の中で文字列で使いたいライブラリー名を指定すると使える
const fs = require('fs');

//一行ずつ読み込むというライブラリーを指定
const readline = require('readline');

//fsモジュールの「createReadStream」メソッドを使ってcsvファイルをストリーム形式で読み込む
const rs = fs.createReadStream('./popu-pref.csv');

//一行ずつ読み込む　inputはrs outputは特になし　rsはreadline
//readlineモジュールの「createInterface」メソッドに先ほど作ったストリーム情報を渡す
//「createInterface」が用意してくれている「input」っていう入れ物にさっき作ったstreamを入れる
const rl = readline.createInterface({ 'input': rs, 'output': {} });

const prefectureDataMap = new Map(); // key: 都道府県　value: 集計データのオブジェクト

//lineイベント(一行読む）を検知したら,引数lineString(一行分の文字列)以下の無名関数を実行してください
//lineは行で読み込めって命令を与えていて、lineStringって変数にループするたびに中身を入れ替えていく処理をする
//そしてその中括弧の中に入れると自動的にループ処理にしてくれる
rl.on('line', (lineString) => {

    //splitはJSのメソッド　指定した箇所で分割された配列を返します。
    const columns = lineString.split(',');

    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {

        //prefectureというkeyを使ってvalueを取得する.データを持っているかをチェック
        let value = prefectureDataMap.get(prefecture);

        //まだデータを持っていないので空っぽのデータを作る。雛形のオブジェクトを作る
    if (!value) {
        value = {
            popu10: 0,
            popu15: 0,
            change: null
        };  
    }
    if (year === 2010) {
        value.popu10 = popu;
    }
    if (year === 2015) {
        value.popu15 = popu;
    } 
    prefectureDataMap.set(prefecture, value);
    }   
});

//もう一回全部一周させている間に変化率を求めている
//分割代入とは？？
rl.on('close', () => {
    for(let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }

    //連想配列はsort関数を持っていないので、sort関数を持っている配列にするためarray.fromを使って変換する
    const rankingArray = Array.from(prefectureDataMap).sort( (pair1, pair2) => {
     
        //pair1が先頭、pair2が後ろ、後ろー前が正の時はひっくり返すという処理をするので大きい順の並び変えになる
        //pair2[1]はオブジェクト,例{ popu10: 361670, popu15: 371756, change: 1.0278873005778748 },[0]はprefecture
        //連想配列を配列にしたので値を2つ持つのでpair
        return pair2[1].change - pair1[1].change;

    }) ;
    const rankingStrings = rankingArray.map(([key, value]) => {
        return key + ':' + value.popu10 + '=>' + value.popu15 + '変化率'　+ value.change;
    });
    console.log(rankingStrings);
}) ;


