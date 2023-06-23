class JuegoBlackjack {
  constructor() {
    this.barajaId = "";
    this.jugador = [];
    this.puntuacionJugador = 0;
    this.dealer = [];
    this.cartasOcultasDealer = 0;
    this.puntuacionDealer = 0;
    this.juegoTerminado = false;
    this.cartasRepartidas = [];
    this.victorias = 0;
    this.derrotas = 0;
    this.empates = 0;
  }

  reiniciar() {
    if (this.juegoTerminado) {
      this.jugador.length = 0;
      this.puntuacionJugador = 0;
      this.dealer.length = 0;
      this.puntuacionDealer = 0;
      this.juegoTerminado = false;
      this.cartasOcultasDealer = 0;
  
      document.getElementById("cartas-jugador").innerHTML = "";
      document.getElementById("cartas-dealer").innerHTML = "";
      document.getElementById("puntos-jugador").innerHTML = "";
      document.getElementById("puntos-dealer").innerHTML = "";
      document.getElementById("resultado").innerHTML = "";
      document.getElementById("finalizar").disabled = true;  
    }

    this.cartasRepartidas = [];

    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      .then((response) => response.json())
      .then((data) => {
        this.barajaId = data.deck_id;
        const barajaMensaje = "Tienes la baraja: " + this.barajaId;
        document.getElementById("mensaje").innerHTML = barajaMensaje;
        document.getElementById("reiniciar").disabled = true;
        document.getElementById("finalizar").disabled = false;
        document.getElementById("resultado").innerHTML = "";

        document.getElementById("cartas-jugador").innerHTML = "";
        document.getElementById("cartas-dealer").innerHTML = "";

        this.repartirCartas();
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  }

  repartirCartas() {
    if (this.jugador.length === 0 && this.dealer.length === 0) {
      fetch(`https://deckofcardsapi.com/api/deck/${this.barajaId}/draw/?count=4`)
        .then((response) => response.json())
        .then((data) => {
          const cartas = data.cards;
  
          const cartaJugador1 = this.obtenerCartaUnica(cartas);
          this.repartirCartaJugador(cartaJugador1);
          this.repartirCartaDealer(this.obtenerCartaUnica(cartas), true);
  
          const cartaJugador2 = this.obtenerCartaUnica(cartas);
          this.repartirCartaJugador(cartaJugador2);
          this.repartirCartaDealer(this.obtenerCartaUnica(cartas), true);
  
          this.actualizarPuntuacion();
  
          if (this.puntuacionJugador === 21) {
            this.terminarJuego("¡Blackjack! ¡Has ganado!");
          }
  
          this.mostrarCartas();
        })
        .catch((err) => {
          console.log("Error: ", err);
        });
    }
  }  

  obtenerCartaUnica(cartas) {
    let carta;
    do {
      const index = Math.floor(Math.random() * cartas.length);
      carta = cartas.splice(index, 1)[0];
    } while (this.cartasRepartidas.includes(carta.code));

    this.cartasRepartidas.push(carta.code);
    return carta;
  }

  repartirCartaJugador(carta) {
    this.jugador.push(carta);
    this.puntuacionJugador += this.obtenerValorCarta(carta);
  }

  repartirCartaDealer(carta, ocultar = false) {
    if (carta) {
      this.dealer.push(carta);
      this.puntuacionDealer += this.obtenerValorCarta(carta);
      if (ocultar) {
        this.cartasOcultasDealer++;
      }
    }
  }
  

  mostrarCartas() {
    const cartasJugador = this.jugador
      .map((carta) => `<img src="${carta.image}">`)
      .join("");
  
      let cartasDealer = this.dealer
      .map((carta, index) => {
        if (index < this.cartasOcultasDealer) {
          return '<img src="../img/oculta.jpeg">';
        } else {
          return `<img src="${carta.image}">`;
        }
      })
      .join("");
  
    const puntosDealer = this.juegoTerminado ? this.puntuacionDealer : "??";
  
    document.getElementById("cartas-jugador").innerHTML =
      "<h3>Jugador</h3>" + cartasJugador;
    document.getElementById("cartas-dealer").innerHTML =
      "<h3>Máquina</h3>" + cartasDealer;
    document.getElementById("puntos-dealer").textContent = puntosDealer;
  }
  

  actualizarPuntuacion() {
    document.getElementById("carta").disabled = this.juegoTerminado || this.puntuacionJugador === 21;
    document.getElementById("puntos-jugador").textContent = this.puntuacionJugador;
    document.getElementById("puntos-dealer").textContent = this.puntuacionDealer;
  }

  pedirCarta() {
    if (this.juegoTerminado) {
      return;
    }
  
    fetch(`https://deckofcardsapi.com/api/deck/${this.barajaId}/draw/?count=2`)
      .then((response) => response.json())
      .then((data) => {
        const cartas = data.cards;
        const cartaJugador = cartas[0];
        const cartaDealer = cartas[1];
  
        this.repartirCartaJugador(cartaJugador);
        this.repartirCartaDealer(cartaDealer, true);
  
        this.actualizarPuntuacion();
  
        if (this.puntuacionJugador > 21) {
          setTimeout(() => {
            this.mostrarCartas();
            this.mostrarCartaDealerOculta();
            this.terminarJuego("¡Has perdido! Puntuación superó 21.");
          }, 1000);
        } else if (this.puntuacionDealer > 21) {
          setTimeout(() => {
            this.mostrarCartas();
            this.terminarJuego("¡Has ganado! La Maquina superó los 21 puntos.");
          }, 1000);
        }
  
        this.mostrarCartas();
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  }

  mostrarCartaDealerOculta() {
    document.getElementById("cartas-dealer").innerHTML =
      "<h3>Maquina</h3>" +
      this.dealer
        .map((carta) => `<img src="${carta.image}">`)
        .join("");
  }

  determinarGanador() {
    this.mostrarCartaDealerOculta();
    this.mostrarCartas();

    if (this.puntuacionJugador > this.puntuacionDealer) {
      this.terminarJuego("¡Has ganado! Tienes una puntuación mayor que la Maquina.");
    } else if (this.puntuacionJugador < this.puntuacionDealer) {
      this.terminarJuego("¡Has perdido! La Maquina tiene una puntuación mayor que la tuya.");
    } else {
      this.empates++;
      this.terminarJuego("¡Empate! Tienes la misma puntuación que la Maquina.");
    }
  }

  finalizar() {
    if (this.juegoTerminado) {
      const mensajeFinal =
        `Partida finalizada. Resultado: Victorias: ${this.victorias} | Derrotas: ${this.derrotas}`;
      document.getElementById("resultado").innerHTML = mensajeFinal;
      document.getElementById("finalizar").disabled = true;
      document.getElementById("reiniciar").disabled = false;
  
      this.reiniciar();
      this.victorias = 0;
      this.derrotas = 0;
      this.mostrarEstadisticas();
    } else {
      this.juegoTerminado = true;
      this.mostrarCartas();
      this.determinarGanador();
    }
  }
  
  terminarJuego(mensaje) {
    this.juegoTerminado = true;
    document.getElementById("resultado").innerHTML = mensaje;
    document.getElementById("carta").disabled = true;
    document.getElementById("finalizar").disabled = true;
    document.getElementById("reiniciar").disabled = false;
  
    this.cartasOcultasDealer = 0;
    this.mostrarCartaDealerOculta();
    this.mostrarCartas();
  
    if (mensaje.includes("ganado")) {
      this.victorias++;
    } else if (mensaje.includes("perdido")) {
      this.derrotas++;
    }
  
    this.mostrarEstadisticas();
  }
  
  
  mostrarEstadisticas() {
    const estadisticas = `Victorias: ${this.victorias} | Derrotas: ${this.derrotas} | Empates: ${this.empates}`;
    document.getElementById("estadisticas").innerHTML = estadisticas;
  }

  obtenerValorCarta(carta) {
    const valor = carta.value;
    if (["KING", "QUEEN", "JACK"].includes(valor)) {
      return 10;
    } else if (valor === "ACE") {
      return 1;
    } else {
      return parseInt(valor);
    }
  }
}

const juego = new JuegoBlackjack();

document.getElementById("reiniciar").addEventListener("click", () => {
  juego.reiniciar();
});

document.getElementById("carta").addEventListener("click", () => {
  juego.pedirCarta();
});

document.getElementById("finalizar").addEventListener("click", () => {
  juego.finalizar();
});


