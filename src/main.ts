//! Tipi per strutturare i dati ricevuti dalle API
type Destination = {
    name: string;    // Nome della città
    country: string; // Stato della città
};

type Weather = {
    temperature: number;         // Temperatura attuale
    weather_description: string; // Descrizione meteo (es. "soleggiato")
};

type Airport = {
    name: string;    // Nome dell'aeroporto principale
};

//! Tipo finale aggregato da restituire
type dashboardCity = {
    airport: string;
    city: string;
    country: string;
    temperature: number;
    weather: string;
}

//! Funzione generica per recuperare e tipizzare i dati da un endpoint
async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url); //? Chiamata HTTP al server
    if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`); //? Gestione errori HTTP
    }
    const data: T = await res.json(); //? Parsing JSON con tipo generico
    return data;
}

//! Funzione principale che compone i dati per la dashboard
const getDashboardData = async (query: string): Promise<dashboardCity | null> => {
    try {
        //? Array di Promesse con i tre tipi di dati richiesti
        const promises: [
            Promise<Destination[]>,
            Promise<Weather[]>,
            Promise<Airport[]>
        ] = [
                fetchJson<Destination[]>(`http://localhost:5000/destinations?search=${query}`),
                fetchJson<Weather[]>(`http://localhost:5000/weathers?search=${query}`),
                fetchJson<Airport[]>(`http://localhost:5000/airports?search=${query}`)
            ];
        const travel = await Promise.all(promises); //? Attende tutte le promesse contemporaneamente
        console.log(travel);

        //? Verifica che tutte le risposte abbiano almeno un elemento
        if (!travel[0][0] || !travel[1][0] || !travel[2][0]) {
            throw new Error("Dati incompleti dalle API");
        }
        //todo Ritorna l'oggetto `dashboardCity` aggregato
        return {
            city: travel[0][0].name,
            country: travel[0][0].country,
            temperature: travel[1][0].temperature,
            weather: travel[1][0].weather_description,
            airport: travel[2][0].name
        }
    } catch (err) {
        //? Gestione errori di rete o altri errori generici
        if (err instanceof Error) {
            console.error(`Errore nel recupero dei dati ${err.message}`);
        } else {
            console.error("Errore sconosciuto:", err);
        }
        return null; //? In caso di errore, ritorna null
    }
}

//! Esecuzione della funzione
getDashboardData("cape town")
    .then(data => {
        console.log('Dashboard data:', data); //? Log generico dei dati aggregati
        if (data === null) {
            throw new Error("La città non è disponibile nel database"); //? Se non sono stati trovati dati validi
        } else {
            //? Messaggio formattato con i dati ottenuti
            console.log(
                `${data.city} is in ${data.country}.\n` +
                `Today there are ${data.temperature} degrees and the weather is ${data.weather}.\n` +
                `The main airport is ${data.airport}.\n`
            );
        }
    })
    .catch(error => console.error(error)); //? Gestione errori a livello di chiamata
