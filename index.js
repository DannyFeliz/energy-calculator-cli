require("colors");
const readline = require("readline");
const Table = require("cli-table3");
console.clear();

// Setup the readline interface
const line = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const chargesList = [];
init();

let chargesCount = 0;
function init() {
  console.log("App para Calcular Fuerzas Eléctricas - Danny Feliz 2015-2015".yellow.bold);
  console.log("============================================================".yellow.bold);
  console.log("");
  line.question("Introduzca el número de cargas que deseas calcular: ".cyan, async localChargesCount => {
    localChargesCount = Number(localChargesCount);
    if (Number.isNaN(localChargesCount)) {
      console.log("Introduzca un valor válido".red);
      return;
    }

    if (localChargesCount < 2) {
      console.log("El número de cargas debe ser igual o mayor a 2".red);
    }

    chargesCount = localChargesCount;

    for (let i = 0; i < localChargesCount; i++) {
      chargesList[i] = await getCharges(i);
    }

    calculateForce();
  });
}

function getCharges(index) {
  return new Promise((resolve, reject) => {
    const charge = {
      magnitude: 0,
      X: 0,
      Y: 0,
      Z: 0
    };

    console.log("");
    line.question(`Introduzca la magnitud de la carga #${index + 1}: `.yellow, answer => {
      charge.magnitude = Number(answer);
      line.question(`Introduzca el valor de la componente X: `.green, answer => {
        charge.X = Number(answer);
        line.question(`Introduzca el valor de la componente Y: `.green, answer => {
          charge.Y = Number(answer);
          line.question(`Introduzca el valor de la componente Z: `.green, answer => {
            charge.Z = Number(answer);
            resolve(charge);
          });
        });
      });
    });
  });
}

function calculateForce() {
  line.question(`\nIntroduzca la fuerza que desea calcular (1-${chargesList.length}): `.cyan, async selectedCharge => {
    selectedCharge = Number(selectedCharge) - 1;

    if (!chargesList[selectedCharge]) {
      console.log(`La carga "${selectedCharge + 1}" que intentas cálcular no es válida`.red);
      calculateForce();
      return;
    }

    chargesCount = selectedCharge + 1;

    let f12x = 0;
    let f12y = 0;
    let f12z = 0;
    let fq = 0;

    for (let i = 0; i < chargesCount; i++) {
      if (selectedCharge == i) {
        continue;
      }

      const charge1 = chargesList[i];
      const charge2 = chargesList[selectedCharge];

      const K = 8987551787;
      const MINIMUN_CHARGE = 0.000001;

      const squareSum = Math.sqrt(
        Math.pow(charge2.X - charge1.X, 2) + Math.pow(charge2.Y - charge1.Y, 2) + Math.pow(charge2.Z - charge1.Z, 2)
      );

      const FORCE =
        (K * (charge1.magnitude * MINIMUN_CHARGE) * (charge2.magnitude * MINIMUN_CHARGE)) / Math.pow(squareSum, 3);

      f12x += FORCE * (charge2.X - charge1.X);
      f12y += FORCE * (charge2.Y - charge1.Y);
      f12z += FORCE * (charge2.Z - charge1.Z);
    }

    fq = Math.sqrt(Math.pow(f12x, 2) + Math.pow(f12y, 2) + Math.pow(f12z, 2));

    const resultTable = new Table({ head: ["Variables", `Resultados de la carga ${selectedCharge + 1}`] });

    resultTable.push(
      { [`FR${selectedCharge + 1}x`]: f12x.toFixed(3) + " N" },
      { [`FR${selectedCharge + 1}y`]: f12y.toFixed(3) + " N" },
      { [`FR${selectedCharge + 1}z`]: f12z.toFixed(3) + " N" },
      { [`Fq${selectedCharge + 1}`]: fq.toFixed(3) + " N" }
    );

    console.log(resultTable.toString());

    calculateForce();
  });
}
