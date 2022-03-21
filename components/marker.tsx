import {
  AdmissionDifficulty,
  Class,
  getHigherAdmissionDifficulty,
  getModeAdmissionDifficulty,
  NurserySchool,
  SUPPORTED_AGES,
} from '../lib/model/nursery-school'
import { LocalNurserySchoolListSet } from '../lib/model/nursery-school-list'
import { FilterProps } from '../pages'
import { blue, yellow } from '../styles/theme'

export type MarkerClickHandler = (params: {
  nursery: NurserySchool
  inNurserySet: LocalNurserySchoolListSet
  marker: google.maps.Marker
}) => void

const markerPath =
  'M20.8737 31.495C27.2804 29.7873 32 23.9448 32 17C32 8.71573 25.2843 2 17 2C8.71573 2 2 8.71573 2 17C2 23.9448 6.71957 29.7873 13.1263 31.495L17 41L20.8737 31.495Z'
const markerAnchor = [17, 41] as const
const markerLabelOrigin = [17, 17] as const

export function createMarkers(
  map: google.maps.Map,
  nurserySets: LocalNurserySchoolListSet[],
  onClick: MarkerClickHandler
) {
  const markers: google.maps.Marker[] = []
  for (const nurserySet of nurserySets) {
    for (const nursery of nurserySet.nurserySchoolList) {
      const marker = new google.maps.Marker({
        map,
        title: nursery.name,
        position: { lat: nursery.location.latitude, lng: nursery.location.longitude },
      })
      markers.push(marker)
      marker.addListener('click', () => {
        onClick({ nursery, inNurserySet: nurserySet, marker })
      })
    }
  }
  return markers
}

export function updateMarkersIconAndVisibility(
  markers: google.maps.Marker[],
  nurserySets: LocalNurserySchoolListSet[],
  filter: FilterProps
) {
  let i = -1

  for (const nurserySet of nurserySets) {
    for (const nursery of nurserySet.nurserySchoolList) {
      i++
      if (
        filter.ageList &&
        filter.ageList.every(age => (nursery.classList as Record<string, Class | null> | null)?.[`age${age}`] == null)
      ) {
        markers[i].setVisible(false)
        continue
      }
      markers[i].setVisible(true)

      const difficulty = (() => {
        if (filter.ageList !== null && filter.ageList.length > 0) {
          return getHigherAdmissionDifficulty(nursery, nurserySet, filter.ageList)
        }
        return getModeAdmissionDifficulty(nursery, nurserySet, filter.ageList ?? SUPPORTED_AGES)
      })()
      const markerStyle = difficultyToStyle(difficulty)

      const now = new Date()
      const isNew = nursery.openYear >= now.getFullYear() && nursery.openMonth > now.getMonth() + 1

      markers[i].setIcon({
        fillColor: isNew ? yellow[50] : markerStyle.color,
        fillOpacity: 1,
        strokeColor: isNew ? yellow[90] : blue[90],
        strokeWeight: 1.5,
        path: markerPath,
        anchor: new google.maps.Point(...markerAnchor),
        labelOrigin: new google.maps.Point(...markerLabelOrigin),
      })
    }
  }
}

export const difficultyToStyle = (difficulty: AdmissionDifficulty | null): { color: string; label: string | null } => {
  switch (difficulty) {
    case AdmissionDifficulty.Easy:
      return { color: blue[50], label: '入りやすい' }
    case AdmissionDifficulty.Moderate:
      return { color: blue[20], label: 'やや入りやすい' }
    case AdmissionDifficulty.Hard:
      return { color: blue[10], label: '入りにくい' }
    case AdmissionDifficulty.Unknown:
      return { color: blue[10], label: null }
    case null: // unknown足したのでnull消せるかもだが十分確認できてない
      return { color: blue[10], label: null }
  }
}
