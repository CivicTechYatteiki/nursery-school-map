import { AdmissionDifficulty, getAdmissionDifficulty, NurserySchool } from '../lib/model/nursery-school'
import { LocalNurserySchoolListSet } from '../lib/model/nursery-school-list'
import { blue } from '../styles/theme'

export type MarkerClickHandler = (params: { nursery: NurserySchool; difficulty: AdmissionDifficulty | null }) => void

const markerPath =
  'M20.8737 31.495C27.2804 29.7873 32 23.9448 32 17C32 8.71573 25.2843 2 17 2C8.71573 2 2 8.71573 2 17C2 23.9448 6.71957 29.7873 13.1263 31.495L17 41L20.8737 31.495Z'

export function createMarkers(
  map: google.maps.Map,
  nurserySets: LocalNurserySchoolListSet[],
  onClick: MarkerClickHandler
) {
  const markers: google.maps.Marker[] = []
  for (const nurserySet of nurserySets) {
    for (const nursery of nurserySet.nurseryShoolList) {
      const difficulty = getAdmissionDifficulty(nursery, nurserySet, null)
      const markerStyle = difficultyToStyle(difficulty)
      const marker = new google.maps.Marker({
        map,
        title: nursery.name,
        position: { lat: nursery.location.latitude, lng: nursery.location.longitude },
        icon: {
          fillColor: markerStyle.color,
          fillOpacity: 1,
          strokeColor: blue[90],
          strokeWeight: 1.5,
          path: markerPath,
        },
      })
      markers.push(marker)
      marker.addListener('click', () => {
        onClick({ nursery, difficulty })
      })
    }
  }
  return markers
}

export const difficultyToStyle = (difficulty: AdmissionDifficulty | null): { color: string; label: string | null } => {
  switch (difficulty) {
    case AdmissionDifficulty.Easy:
      return { color: blue[50], label: '入りやすい' }
    case AdmissionDifficulty.Moderate:
      return { color: blue[20], label: 'やや入りやすい' }
    case AdmissionDifficulty.Hard:
      return { color: blue[10], label: '入りにくい' }
    case null:
      return { color: blue[10], label: null }
  }
}
