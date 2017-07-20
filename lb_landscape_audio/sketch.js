/*
Les deux modes de remplissage du buffer sont intéressants
Il faut jouer la "musique" ) un ryhtme relativement soutenu
Ajouter un petit son au début de chaque jour
Ajouter un lfo dont la fréquence dépend de l'activité générale ?

*/

// envisager quelque chose de plus graphique ? genre music make you travel ?
// utiliser deux cannaux audio avec les données agencées différement ?

// padder l'audio avec des valeurs alétoires plutôt que de zéros // hum hum // essayer de mieux distribuer l'audio entre -1 et 1
// un buffer de 1024 car 6*34*5 = 1020

// ajouter gui date de départ, date de fin, play / pause / stop , filtrage par lieux , par catégories documentaire ? vitesse de défilement des dates, durée d'interpolation vis et audio
var mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var colorNames = ["bleu", "orange", "rouge", "vert", "jaune", "violet", "blanc"];
/* Lieux*/
var lieux = [
 "Bourg", "Haute Chaussée", "Charles-Gautier-Hermeland", "Bellevue", "Ludothèque Municipale", "Gao Xingjian - Sillon"
];
/* Emplacements */
var emplacements = [
    "albums", "arts", "graphisme", "bd adultes", "bd jeunesse", "cinema adultes", "cinema jeunesse", "cinema", "danse", "geographie", "histoire", "informatique", "jeux d'assemblage", "jeux d'exercices", "livres sur les jeux", "jeux a regles", "jeux symboliques", "jeux video", "langues", "litterature", "loisirs creatifs", "musique adultes", "musique jeunesse", "philosophie", "presse", "fonds pro", "psychologie", "romans adultes", "romans jeunesse", "religions", "sciences", "societe", "sports et loisirs", "vie pratique", "theatre"
]
var db
var index = 1;
var play = true
var colors
var fontBold
var fontRegular
var buffer,img;

var mode = 1 // audio mode : par lieu ou par emplacement ?

var imgBuffer,img;

function preload() {
    db = loadJSON("../data/db_06122017.json");
    fontBold = loadFont("../assets/RenneBolArcTyp.otf")
    fontRegular = loadFont("../assets/RenneArcTyp.otf")
    ctx = getAudioContext();
    bufferSize = 1024
    node = ctx.createBufferSource();
        // createBuffer(channels, samples, sampleRate)
    buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        data[i] = 0;
    }
}

function setup() {

    createCanvas(windowWidth, windowHeight);
    background(0);
    //frameRate(1)
    textAlign(CENTER, CENTER);
    textFont(fontBold);
    textSize(25)
    colors = {
        bleu: color(0, 165, 255, 255)
        , orange: color(255, 120, 0, 255)
        , rouge: color(255, 0, 0, 255)
        , vert: color(0, 255, 150, 255)
        , jaune: color(255, 255, 85, 255)
        , violet: color(142, 75, 167, 255)
        , blanc: color(255, 255, 255, 255)
    }

    node.buffer = buffer;
    node.loop = true;
    node.connect(p5.soundOut);
    node.start(0);

    img = createGraphics(windowWidth,windowHeight);
    imgBuffer = createGraphics(windowWidth,windowHeight);
    imgBuffer.background(0);
    img.background(0);
}






function draw() {
    //background(0);

    noStroke()
    image(img,0,0,windowWidth,windowHeight)


    // se déplacer d'un jour dans la base de données
    if (frameCount % int(map(mouseX,0,width,60,10)) == 0 && play) {
        index += 1;
        console.log(index, db.length)
        if (index >= db.length-2) index = 1

    }

    if (play) update();




    fill(255);
    stroke(255);
    var d = db[index].date.split("/")
    var date = new Date(d[2], d[0] - 1, d[1])
    textSize(36)
    text(jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(), width / 2, 20);
    textSize(24)
    text(db[index].Tous.total + " prêts", width / 2, 60);
}

function update(){

        var yoffset = -map(mouseX,0,windowWidth,5,25)
        // on dessine notre image en fond de notre buffer (c'est le premier dessin qu'on effectue les suivants seront donc par dessus)
        imgBuffer.noStroke()
        imgBuffer.image(img,0,yoffset,img.width,img.height);

        //buffer.filter(BLUR,0.48); // le blur est un peu gourmand à haute résolution
        // on le remplace par le "blur du pauvre" : un rectangle noir très transparent

        imgBuffer.fill(0,2);
        imgBuffer.rect(0, 0, img.width, img.height)

        updateAudioBuffer()

        img = imgBuffer;
}


function updateAudioBuffer() {

    data = node.buffer.getChannelData(0)

    var indexLieu
    var indexEmplacement

    for (var i = 0; i < bufferSize/2; i++) {
         imgBuffer.stroke(255,5)
        imgBuffer.strokeWeight(0.45)


            var y = map(abs(data[i]), 1, 0, imgBuffer.height, windowHeight-125);
            imgBuffer.line(0, y+random(-100,100) ,imgBuffer.width+100,y +random(-100,100) );
        }

    //imgBuffer.beginShape(); // on commence à dessiner notre forme
   // imgBuffer.curveVertex(0, imgBuffer.height) // on ajoute un premier point dans le coin en bas à gauche

    for (var i = 0; i < bufferSize; i++) {
        if(mode == 1){
            indexLieu = int(i/5) % lieux.length
            indexEmplacement = int(int(i/5)/lieux.length)

            if(indexLieu < lieux.length && indexEmplacement < emplacements.length-1){
                var t = float(map(db[index][lieux[indexLieu]][emplacements[indexEmplacement]], 0, int(db[0]["Max_Tous"]), 0, 1))
                 data[i] += (t - data[i]) * 0.95

            }
            else {
                data[i] = 0

            }
        }

        else {
            indexEmplacement = int(i/5) % emplacements.length
            indexLieu = int(int(i/5)/emplacements.length)

            if(indexLieu < lieux.length && indexEmplacement < emplacements.length-1){
                var t = float(map(db[index][lieux[indexLieu]][emplacements[indexEmplacement]], 0, int(db[0]["Max_Tous"]), 0, 1))
                  data[i] += (t - data[i]) * map(mouseX,0,width,0.095,0.81);

            }
            else {
                data[i] = 0

            }
        }

        var xpos = map(i, 0, bufferSize, 0, windowWidth)
        var hei = map(data[i], 0, 1, 1, windowHeight/5)
        imgBuffer.noStroke();


        imgBuffer.fill(colors[colorNames[indexLieu]])
        imgBuffer.rect(xpos, windowHeight-100, windowWidth/bufferSize, -hei);
    }

}



function keyPressed(){
 if (mode != 1){
   mode =1
 }
    else {
     mode =0
    }

}


function mousePressed() {
    play = !play
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    img = createGraphics(windowWidth,windowHeight);
    imgBuffer = createGraphics(windowWidth,windowHeight);
    imgBuffer.background(0);
    img.background(0);
}
