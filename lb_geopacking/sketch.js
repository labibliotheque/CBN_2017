// filtrage par over sur les couleurs à gauche et sur les lieux

// faire apparaitre les cercles dans la journée manière séquentielle
// ajouter des ambiances sonores granularisées captées sur chacun des lieux ou pas ...
// ajuster l'évolution de la transparence en fonction de la durée moyenne d'un prêt
// ajouter gui date de départ, date de fin, play / pause / stop , filtrage par lieux , par catégories documentaire ? vitesse de défilement des dates, durée d'interpolation vis et audio

var mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var lieux = [
"Bourg", "Haute Chaussée", "Charles-Gautier-Hermeland", "Bellevue", "Ludothèque Municipale", "Gao Xingjian - Sillon"
];
var emplacements = [
    "arts","cinema adultes", "cinema jeunesse", "graphisme","danse","musique adultes","musique jeunesse","theatre","albums","bd adultes","bd jeunesse","litterature", "romans adultes","romans jeunesse","geographie",
 	"histoire",
 	"informatique",
 	"langues",
 	"loisirs creatifs",
 	"philosophie",
 	"psychologie",
 	"sciences",
	"fonds pro",
    "presse",
 	"societe",
 	"sports et loisirs",
 	"vie pratique",
    "livres sur les jeux",
    "jeux d'assemblage",
 	"jeux d'exercices",
 	"jeux a regles",
 	"jeux symboliques",
	"jeux video",
]
var db
var index = 1;
var play = true
var fontBold
var fontRegular
var img = new Image;
var png;
var coordinates = {
    "Bourg": [0.247, 0.671]
    , "Haute Chaussée": [0.136, 0.758]
    , "Charles-Gautier-Hermeland": [0.493, 0.328]
    , "Bellevue": [0.530, 0.746]
    , "Ludothèque Municipale": [0.486, 0.929]
    , "Gao Xingjian - Sillon": [0.602, 0.147]
}
var nodes = []

function preload() {
    db = loadJSON("../data/db_06122017.json");
    fontBold = loadFont("../assets/RenneBolArcTyp.otf")
    fontRegular = loadFont("../assets/RenneArcTyp.otf")
    img.src = "../assets/fond_carte_no_text.svg";
    // png = loadImage('../assets/fond_de_carte_no_text.png')
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100)
    textAlign(CENTER, CENTER);
    textFont(fontBold);
    textSize(25)
}

function draw() {
    background(255);

    /* update the date and create new nodes */
    if (frameCount % 120 == 0 && play) {
        index += 1;
        console.log(index, nodes.length);
        for (var i = 0; i < lieux.length; i++) {
            for (var j = 0; j < emplacements.length; j++) {
                var xpos = coordinates[lieux[i]][0] * windowWidth
                var ypos = coordinates[lieux[i]][1] * windowHeight
                var h = map(j, 0, emplacements.length, 0, 320)
                var s = map(db[index][lieux[i]][emplacements[j]], 0, int(db[0]["Max_Tous"]), 25, 175)
                var d = db[index].date
                var data = {
                    date : d,
                    lieu: lieux[i]
                    , emplacement: emplacements[j]
                    , valeur: db[index][lieux[i]][emplacements[j]]
                }
                if (s > 25) {
                    nodes.push(new Node(xpos + random(-15, 15), ypos + random(-15, 15), h, s, data))
                }
            }
        }
    }
    /* update life*/
    if (frameCount%5 == 0 &&   play) {
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].life -= 0.25;
            nodes[i].diameter -= 0.015;
            if (nodes[i].life < 5) nodes.splice(i, 1)
        }
    }
    /* draw background image*/
    // image(png,0,0,windowWidth,windowHeight);
    drawingContext.drawImage(img, 0, 20, windowWidth, windowHeight);


    /* draw date and title*/
    fill(0);
    stroke(0);
    var d = db[index].date.split("/")
    var date = new Date(d[2], d[0] - 1, d[1])
    textSize(36)
    text(jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(), width / 2, 20);
    textSize(24)
    text(db[index].Tous.total + " prêts", width / 2, 60)

    /* update and display the data*/
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].update();
        nodes[i].display();
        for (var j = 0; j < nodes.length; j++) {
            if (i != j) nodes[i].attract(nodes[j])
        }
        nodes[i].over(mouseX,mouseY)
    }

    /* draw names*/
    textFont(fontRegular)
    textSize(20)
    for (var i = 0 ; i < lieux.length ; i++){
        text(lieux[i], coordinates[lieux[i]][0]*windowWidth, coordinates[lieux[i]][1]*windowHeight)
    }


    /* draw color legend*/
    for(var i = 0 ; i < emplacements.length ; i++){
        var h = map(i, 0, emplacements.length, 0, 320)
        textAlign(LEFT,CENTER)
        noStroke();
        fill(h,100,100)
        ellipse(10,10+i*20,15,15)
        fill(0)
        textFont(fontRegular)
        textSize(14)
        text(emplacements[i] , 20,10+i*20)
    }


}

function mousePressed() {
    play = !play
    console.log(mouseX / windowWidth, mouseY / windowHeight)
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
