package services

import (
	"strings"

	"pocket-guide-backend/internal/models"
)

type landmarkPoint struct {
	Name     string
	Location models.Location
}

var destinationBaseCoordinates = map[string]models.Location{
	"lisboa":         {Lat: 38.7223, Lng: -9.1393},
	"porto":          {Lat: 41.1579, Lng: -8.6291},
	"barcelona":      {Lat: 41.3851, Lng: 2.1734},
	"madrid":         {Lat: 40.4168, Lng: -3.7038},
	"sevilha":        {Lat: 37.3891, Lng: -5.9845},
	"sevilla":        {Lat: 37.3891, Lng: -5.9845},
	"roma":           {Lat: 41.9028, Lng: 12.4964},
	"rome":           {Lat: 41.9028, Lng: 12.4964},
	"paris":          {Lat: 48.8566, Lng: 2.3522},
	"rio de janeiro": {Lat: -22.9068, Lng: -43.1729},
	"rio":            {Lat: -22.9068, Lng: -43.1729},
	"niteroi":        {Lat: -22.8832, Lng: -43.1034},
	"niterói":        {Lat: -22.8832, Lng: -43.1034},
	"são paulo":      {Lat: -23.5505, Lng: -46.6333},
	"sao paulo":      {Lat: -23.5505, Lng: -46.6333},
	"buenos aires":   {Lat: -34.6037, Lng: -58.3816},
	"bangkok":        {Lat: 13.7563, Lng: 100.5018},
	"tokyo":          {Lat: 35.6762, Lng: 139.6503},
	"tóquio":         {Lat: 35.6762, Lng: 139.6503},
}

var destinationLandmarkCoordinates = map[string][]landmarkPoint{
	"lisboa": {
		{Name: "Praca do Comercio", Location: models.Location{Lat: 38.7139, Lng: -9.1394}},
		{Name: "Alfama", Location: models.Location{Lat: 38.7071, Lng: -9.1355}},
		{Name: "Belem", Location: models.Location{Lat: 38.6968, Lng: -9.2068}},
		{Name: "Rossio", Location: models.Location{Lat: 38.7201, Lng: -9.1456}},
	},
	"porto": {
		{Name: "Ribeira", Location: models.Location{Lat: 41.1406, Lng: -8.6110}},
		{Name: "Palacio da Bolsa", Location: models.Location{Lat: 41.1421, Lng: -8.6176}},
		{Name: "Avenida dos Aliados", Location: models.Location{Lat: 41.1496, Lng: -8.6109}},
		{Name: "Sao Bento", Location: models.Location{Lat: 41.1570, Lng: -8.6295}},
	},
	"barcelona": {
		{Name: "Sagrada Familia", Location: models.Location{Lat: 41.4036, Lng: 2.1744}},
		{Name: "Park Guell", Location: models.Location{Lat: 41.4145, Lng: 2.1527}},
		{Name: "Barceloneta", Location: models.Location{Lat: 41.3809, Lng: 2.1850}},
		{Name: "Bairro Gotico", Location: models.Location{Lat: 41.3870, Lng: 2.1700}},
	},
	"madrid": {
		{Name: "Plaza Mayor", Location: models.Location{Lat: 40.4154, Lng: -3.7074}},
		{Name: "Museu do Prado", Location: models.Location{Lat: 40.4193, Lng: -3.6919}},
		{Name: "Santiago Bernabeu", Location: models.Location{Lat: 40.4531, Lng: -3.6883}},
		{Name: "Parque do Retiro", Location: models.Location{Lat: 40.4270, Lng: -3.6878}},
	},
	"sevilha": {
		{Name: "Metropol Parasol", Location: models.Location{Lat: 37.3861, Lng: -5.9923}},
		{Name: "Alcazar de Sevilha", Location: models.Location{Lat: 37.3772, Lng: -5.9869}},
		{Name: "Catedral de Sevilha", Location: models.Location{Lat: 37.3859, Lng: -5.9952}},
		{Name: "Bairro Santa Cruz", Location: models.Location{Lat: 37.3922, Lng: -5.9941}},
	},
	"sevilla": {
		{Name: "Metropol Parasol", Location: models.Location{Lat: 37.3861, Lng: -5.9923}},
		{Name: "Real Alcazar", Location: models.Location{Lat: 37.3772, Lng: -5.9869}},
		{Name: "Catedral de Sevilla", Location: models.Location{Lat: 37.3859, Lng: -5.9952}},
		{Name: "Santa Cruz", Location: models.Location{Lat: 37.3922, Lng: -5.9941}},
	},
	"roma": {
		{Name: "Coliseu", Location: models.Location{Lat: 41.8902, Lng: 12.4922}},
		{Name: "Vaticano", Location: models.Location{Lat: 41.9029, Lng: 12.4534}},
		{Name: "Fontana di Trevi", Location: models.Location{Lat: 41.8986, Lng: 12.4769}},
		{Name: "Piazza Venezia", Location: models.Location{Lat: 41.9009, Lng: 12.4833}},
	},
	"rome": {
		{Name: "Colosseum", Location: models.Location{Lat: 41.8902, Lng: 12.4922}},
		{Name: "Vatican", Location: models.Location{Lat: 41.9029, Lng: 12.4534}},
		{Name: "Trevi Fountain", Location: models.Location{Lat: 41.8986, Lng: 12.4769}},
		{Name: "Piazza Venezia", Location: models.Location{Lat: 41.9009, Lng: 12.4833}},
	},
	"paris": {
		{Name: "Torre Eiffel", Location: models.Location{Lat: 48.8584, Lng: 2.2945}},
		{Name: "Museu do Louvre", Location: models.Location{Lat: 48.8606, Lng: 2.3376}},
		{Name: "Ilha de Saint-Louis", Location: models.Location{Lat: 48.8529, Lng: 2.3500}},
		{Name: "Montmartre", Location: models.Location{Lat: 48.8867, Lng: 2.3431}},
	},
	"rio de janeiro": {
		{Name: "Cristo Redentor", Location: models.Location{Lat: -22.9519, Lng: -43.2105}},
		{Name: "Copacabana", Location: models.Location{Lat: -22.9711, Lng: -43.1822}},
		{Name: "Ipanema", Location: models.Location{Lat: -22.9847, Lng: -43.1986}},
		{Name: "Lapa", Location: models.Location{Lat: -22.9135, Lng: -43.2302}},
	},
	"rio": {
		{Name: "Cristo Redentor", Location: models.Location{Lat: -22.9519, Lng: -43.2105}},
		{Name: "Copacabana", Location: models.Location{Lat: -22.9711, Lng: -43.1822}},
		{Name: "Ipanema", Location: models.Location{Lat: -22.9847, Lng: -43.1986}},
		{Name: "Lapa", Location: models.Location{Lat: -22.9135, Lng: -43.2302}},
	},
	"niteroi": {
		{Name: "Caminho Niemeyer", Location: models.Location{Lat: -22.9068, Lng: -43.1222}},
		{Name: "Museu de Arte Contemporanea", Location: models.Location{Lat: -22.9064, Lng: -43.1118}},
		{Name: "Praia de Itacoatiara", Location: models.Location{Lat: -22.9492, Lng: -43.1108}},
		{Name: "Centro de Niteroi", Location: models.Location{Lat: -22.8832, Lng: -43.1034}},
	},
	"niterói": {
		{Name: "Caminho Niemeyer", Location: models.Location{Lat: -22.9068, Lng: -43.1222}},
		{Name: "Museu de Arte Contemporanea", Location: models.Location{Lat: -22.9064, Lng: -43.1118}},
		{Name: "Praia de Itacoatiara", Location: models.Location{Lat: -22.9492, Lng: -43.1108}},
		{Name: "Centro de Niteroi", Location: models.Location{Lat: -22.8832, Lng: -43.1034}},
	},
	"sao paulo": {
		{Name: "Avenida Paulista", Location: models.Location{Lat: -23.5614, Lng: -46.6559}},
		{Name: "Parque Ibirapuera", Location: models.Location{Lat: -23.5880, Lng: -46.6580}},
		{Name: "Centro Historico", Location: models.Location{Lat: -23.5503, Lng: -46.6339}},
		{Name: "Mercado Municipal", Location: models.Location{Lat: -23.5467, Lng: -46.6412}},
	},
	"são paulo": {
		{Name: "Avenida Paulista", Location: models.Location{Lat: -23.5614, Lng: -46.6559}},
		{Name: "Parque Ibirapuera", Location: models.Location{Lat: -23.5880, Lng: -46.6580}},
		{Name: "Centro Historico", Location: models.Location{Lat: -23.5503, Lng: -46.6339}},
		{Name: "Mercado Municipal", Location: models.Location{Lat: -23.5467, Lng: -46.6412}},
	},
	"buenos aires": {
		{Name: "Plaza de Mayo", Location: models.Location{Lat: -34.6037, Lng: -58.3816}},
		{Name: "Recoleta", Location: models.Location{Lat: -34.5875, Lng: -58.3974}},
		{Name: "Puerto Madero", Location: models.Location{Lat: -34.6081, Lng: -58.3702}},
		{Name: "Palermo", Location: models.Location{Lat: -34.6158, Lng: -58.4333}},
	},
	"bangkok": {
		{Name: "Siam", Location: models.Location{Lat: 13.7466, Lng: 100.5347}},
		{Name: "Grand Palace", Location: models.Location{Lat: 13.7527, Lng: 100.4931}},
		{Name: "Old Town", Location: models.Location{Lat: 13.7563, Lng: 100.5018}},
		{Name: "Sukhumvit", Location: models.Location{Lat: 13.7378, Lng: 100.5601}},
	},
	"tokyo": {
		{Name: "Asakusa", Location: models.Location{Lat: 35.7100, Lng: 139.8107}},
		{Name: "Tokyo Tower", Location: models.Location{Lat: 35.6586, Lng: 139.7454}},
		{Name: "Shinjuku", Location: models.Location{Lat: 35.6895, Lng: 139.6917}},
		{Name: "Shibuya", Location: models.Location{Lat: 35.6764, Lng: 139.6993}},
	},
	"tóquio": {
		{Name: "Asakusa", Location: models.Location{Lat: 35.7100, Lng: 139.8107}},
		{Name: "Tokyo Tower", Location: models.Location{Lat: 35.6586, Lng: 139.7454}},
		{Name: "Shinjuku", Location: models.Location{Lat: 35.6895, Lng: 139.6917}},
		{Name: "Shibuya", Location: models.Location{Lat: 35.6764, Lng: 139.6993}},
	},
}

func baseCoordinatesForDestination(destination string) (models.Location, bool) {
	normalized := strings.ToLower(strings.TrimSpace(destination))
	location, ok := destinationBaseCoordinates[normalized]
	return location, ok
}

func landmarkCoordinatesForDestination(destination string) ([]landmarkPoint, bool) {
	normalized := strings.ToLower(strings.TrimSpace(destination))

	if points, ok := destinationLandmarkCoordinates[normalized]; ok {
		return points, true
	}

	for key, points := range destinationLandmarkCoordinates {
		if strings.Contains(normalized, key) {
			return points, true
		}
	}

	return nil, false
}

func landmarkPointForDestinationSeed(destination string, seed int) (landmarkPoint, bool) {
	if seed < 0 {
		seed = -seed
	}

	points, ok := landmarkCoordinatesForDestination(destination)
	if !ok || len(points) == 0 {
		return landmarkPoint{}, false
	}

	return points[seed%len(points)], true
}

func locationForDestinationSeed(destination string, seed int) models.Location {
	if seed < 0 {
		seed = -seed
	}

	if point, ok := landmarkPointForDestinationSeed(destination, seed); ok {
		return point.Location
	}

	base, ok := baseCoordinatesForDestination(destination)
	if !ok {
		base = models.Location{Lat: 38.7223, Lng: -9.1393}
	}

	offsets := []struct {
		lat float64
		lng float64
	}{
		{lat: 0.0025, lng: 0.0018},
		{lat: -0.0017, lng: 0.0022},
		{lat: 0.0012, lng: -0.0020},
		{lat: -0.0021, lng: -0.0014},
	}

	selected := offsets[seed%len(offsets)]
	return models.Location{
		Lat: base.Lat + selected.lat,
		Lng: base.Lng + selected.lng,
	}
}

func enrichItineraryLocations(destination string, items []models.ItineraryItem) []models.ItineraryItem {
	landmarkPoints, hasLandmarkPoints := landmarkCoordinatesForDestination(destination)

	for index := range items {
		if !hasLandmarkPoints && items[index].Location != nil && items[index].Location.Lat != 0 && items[index].Location.Lng != 0 {
			continue
		}

		var location models.Location
		if hasLandmarkPoints {
			selectedPoint := landmarkPoints[index%len(landmarkPoints)]
			location = selectedPoint.Location
			if shouldReplaceItineraryName(items[index].Name) {
				items[index].Name = selectedPoint.Name
			}
		} else {
			location = locationForDestinationSeed(destination, index)
		}
		items[index].Location = &location
	}

	return items
}

func fallbackLocationForDestination(destination string, day int, slot int) *models.Location {
	seed := (day * 10) + slot
	location := locationForDestinationSeed(destination, seed)
	return &location
}

func fallbackPlaceNameForDestination(destination string, day int, slot int) string {
	seed := (day * 10) + slot
	if point, ok := landmarkPointForDestinationSeed(destination, seed); ok {
		return point.Name
	}
	return "Local Experience"
}

func shouldReplaceItineraryName(name string) bool {
	normalized := strings.ToLower(strings.TrimSpace(name))
	if normalized == "" {
		return true
	}

	genericPatterns := []string{
		"city discovery walk",
		"local experience",
		"activity",
		"experience",
		"generic",
		"explore ",
		"morning tour",
		"local lunch",
		"cultural site visit",
		"dinner and evening entertainment",
		"discover the main attractions",
	}

	for _, pattern := range genericPatterns {
		if strings.Contains(normalized, pattern) {
			return true
		}
	}

	return false
}
