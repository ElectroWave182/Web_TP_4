var x, y;
var diffX, diffY;

var precedent = Date.now ();
var ecartTemps = 0;

var reinitialisation = false;
var nbImagesRetour;

const ips = 25;
const imagesAnimationRetour = 50;
const pesanteur = 9.806 + .0001 * .65;
const acceleration = pesanteur / ips;
const coefFrotte = 0.001;
const seuilImmobile = 0.001;
const bordGauche = 150;
const bordHaut = -5;


// 1)

function selectionner (selecteur)
{
	
	return Array.from (document.querySelectorAll (selecteur));

}


// 2)

function noeudsTexteRec (elementaires, noeud)
{

	// Cas de base (noeud textuel)
	if (noeud.nodeName === "#text")
	{
		elementaires.push (noeud);
	}
	
	// Cas récursif
	else if (noeud.childNodes.length)
	{
		for (const fils of noeud.childNodes)
		{
			noeudsTexteRec (elementaires, fils);
		}
	}
	
}

function noeudsTexte ()
{
	
	var elementaires = Array ();
	noeudsTexteRec (elementaires, document);
	return elementaires;
	
}


// 3)

function listeCar (texte)
{

	if
	(
		texte === undefined ||
		texte === null
	)
	{
		return Array ();
	}
	
	return texte.split ("");
	
}

function separeCar ()
{
	
	var noeudCar;
	for (const noeudTexte of noeudsTexte ())
	{
		const caracteres = listeCar (noeudTexte.nodeValue);
		for (const car of caracteres)
		{
			noeudCar = document.createElement ("span");
			noeudTexte.parentNode.appendChild (noeudCar);
			noeudCar.innerHTML = car;
			
			// Les caractères invisibles ne bougent pas
			if (! [' ', '\t', '\r', '\n'].includes (car))
			{
				const rectangle = noeudCar.getBoundingClientRect ();
				
				noeudCar.classList.add ("caractere");
				noeudCar.setAttribute ("absoluteX", rectangle.left);
				noeudCar.setAttribute ("absoluteY", rectangle.top);
				noeudCar.setAttribute ("baseLargeur", noeudCar.offsetWidth);
				noeudCar.setAttribute ("baseHauteur", noeudCar.offsetHeight);
				noeudCar.setAttribute ("posX", 0);
				noeudCar.setAttribute ("posY", 0);
				noeudCar.setAttribute ("vitX", 0);
				noeudCar.setAttribute ("vitY", 0);
				noeudCar.setAttribute ("force", 0);
				noeudCar.setAttribute ("imagesMouvement", 0);
				noeudCar.style.position = "relative";
			}
		}
		noeudTexte.parentNode.removeChild (noeudTexte);
	}
	
}


// 4)

function ecouteSouris ()
{
	
	document.onmousemove = sourisBouge;

	for (const separe of selectionner (".caractere"))
	{
		separe.onmouseenter = sourisArrive (separe);
	}
	
}

function sourisBouge ()
{
	
	const nouvX = event.pageX;
	const nouvY = event.pageY;
	diffX = nouvX - x;
	diffY = nouvY - y;
	x = nouvX;
	y = nouvY;
	
}

function sourisArrive (cible)
{
	return function ()
	{
		
		const force = Math.round (Math.pow
		(
			Math.pow (diffX, 2) +
			Math.pow (diffY, 2),
			0.5
		));
		
		cible.setAttribute ("vitX", diffX);
		cible.setAttribute ("vitY", diffY);
		cible.setAttribute ("force", force);
		cible.classList.add ("moving");
		
	};
}


// 5)

function deplacer (_element)
{
	
	const compteur = Number (_element.getAttribute ("imagesMouvement")) + 1;
	_element.setAttribute ("imagesMouvement", compteur);
	
	var nouvAbsoluteX =
		Number (_element.getAttribute ("absoluteX")) +
		Number (_element.getAttribute ("vitX"))
	;
	var nouvAbsoluteY =
		Number (_element.getAttribute ("absoluteY")) +
		Number (_element.getAttribute ("vitY"))
	;
	
	var nouvX =
		Number (_element.getAttribute ("posX")) +
		Number (_element.getAttribute ("vitX"))
	;
	var nouvY =
		Number (_element.getAttribute ("posY")) +
		Number (_element.getAttribute ("vitY"))
	;
	
	
	// Tests de sortie des bordures
	
	// Sortie à gauche
	if (nouvAbsoluteX < bordGauche)
	{
		nouvX -= nouvAbsoluteX - bordGauche;
		nouvAbsoluteX = bordGauche;
		_element.setAttribute ("vitX", 0);
	}
	
	// Sortie en haut
	if (nouvAbsoluteY < bordHaut)
	{
		nouvY -= nouvAbsoluteY - bordHaut;
		nouvAbsoluteY = bordHaut;
		_element.setAttribute ("vitY", 0);
	}
	
	
	// Test d'immobilité
	
	if
	(
		_element.getAttribute ("vitX") == 0 &&
		_element.getAttribute ("vitY") == 0
	)
	{
		_element.setAttribute ("imagesMouvement", 0);
		_element.classList.remove ("moving");
	}
	
	
	// Translation horizontale
	
	_element.setAttribute ("absoluteX", nouvAbsoluteX);
	_element.setAttribute ("absoluteY", nouvAbsoluteY);
	_element.setAttribute ("posX", nouvX);
	_element.setAttribute ("posY", nouvY);
	_element.style.left = Math.round (nouvX) + "px";
	_element.style.top = Math.round (nouvY) + "px";
	
	
	// Rotation

	_element.style.transform =
		"rotate("
		+ _element.getAttribute ("force")
		+ "deg)"
	;
	
	
	// Translation verticale
	
	var nouvLargeur = Math.round
	(
		_element.style.width.replace ("px", "")
		- acceleration * _element.getAttribute ("imagesMouvement")
		+ _element.getAttribute ("force")
	);
	var nouvHauteur = Math.round
	(
		_element.style.height.replace ("px", "")
		- acceleration * _element.getAttribute ("imagesMouvement")
		+ _element.getAttribute ("force")
	);
	
	if
	(
		nouvLargeur < _element.getAttribute ("baseLargeur") ||
		nouvHauteur < _element.getAttribute ("baseHauteur")
	)
	{
		nouvLargeur = _element.getAttribute ("baseLargeur");
		nouvHauteur = _element.getAttribute ("baseHauteur");
	}
	
	_element.style.width = nouvLargeur + "px";
	_element.style.height = nouvHauteur + "px";
	
}

function anime ()
{
	
	const actuel = Date.now ();
	ecartTemps = actuel - precedent;
	precedent = actuel;


	// 8)

	if (reinitialisation)
	{
		
		if (nbImagesRetour == 0)
		{
			reinitialisation = false;
			
			for (const carBouge of selectionner (".caractere.moving"))
			{
				carBouge.setAttribute ("vitX", 0);
				carBouge.setAttribute ("vitY", 0);
				carBouge.classList.remove ("moving");
			}
		}
		
		for (const carBouge of selectionner (".caractere.moving"))
		{
			deplacer (carBouge);
		}
		
		nbImagesRetour --;
		
	}
	else
	{
		
		const multiplicateur = Math.max (0, 1 - ecartTemps * coefFrotte);
		
		for (const carBouge of selectionner (".caractere.moving"))
		{
			const nouvX = multiplicateur * carBouge.getAttribute ("vitX");
			const nouvY = multiplicateur * carBouge.getAttribute ("vitY");
			
			if
			(
				nouvX < seuilImmobile &&
				nouvY < seuilImmobile
			)
			{
				carBouge.setAttribute ("vitX", 0);
				carBouge.setAttribute ("vitY", 0);
				carBouge.setAttribute ("imagesMouvement", 0);
				carBouge.classList.remove ("moving");
			}
			else
			{
				carBouge.setAttribute ("vitX", nouvX);
				carBouge.setAttribute ("vitY", nouvY);
				deplacer (carBouge);
			}
		}
	
	}
	
	// Appel toutes les 40 ms.
	setTimeout (anime, 20);
	
}


// 6)

function initialisation ()
{
	
	separeCar ();
	ecouteSouris ();
	document.onkeydown = ecouteClavier;
	tests ();
	anime ();

}


// 7)

function ecouteClavier (keyDown)
{

	// Barre espace
	if (keyDown.which === 32)
	{
		if (! reinitialisation)
		{
			for (const carBouge of selectionner (".caractere"))
			{
				const decalegeHorizontal = carBouge.getAttribute ("posX");
				const decalegeVertical = carBouge.getAttribute ("posY");
				
				carBouge.setAttribute ("vitX", decalegeHorizontal / imagesAnimationRetour);
				carBouge.setAttribute ("vitY", decalegeVertical / imagesAnimationRetour);
				carBouge.classList.add ("moving");
			}
			
			reinitialisation = true;
			nbImagesRetour = imagesAnimationRetour;
		}
	}

}


// Debug)

function tests ()
{
	
	console.log ("Numbers :");
	console.log (Number ("0.125") + "2.5");
	console.log ("0.125" + Number ("2.5"));
	console.log (Number ("0.125") + Number ("2.5"));
	
	console.log ("Fonction selectionner :");
	console.log (selectionner ("#footer-places"));
	console.log (selectionner (".mw-footer"));
	console.log (selectionner ("footer"));
	console.log (selectionner (".vector-menu.mv-portlet"));
	
	console.log ("Fonction noeudsTexte :");
	console.log (noeudsTexte ());
	
	console.log ("Fonction listeCar :");
	console.log (listeCar (undefined));
	console.log (listeCar ("_éh ho\nl'ol"));
	
	console.log ("Fonction separeCar :");
	console.log (selectionner (".caractere"));
	console.log (selectionner (".caractere")[0].getAttribute ("posX"));
	
	console.log ("Fonction ecouteSouris :");
	console.log ("Faire les affichages à l'intérieur");
	console.log (document.innerWidth + ", " + document.innerHeight);
	
}


initialisation ();
