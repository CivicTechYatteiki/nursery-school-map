import { Status, Wrapper } from '@googlemaps/react-wrapper'
import ErrorIcon from '@mui/icons-material/Error'
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined'
import {
  Alert,
  AlertProps,
  AppBar,
  Button,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Snackbar,
  SnackbarProps,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'
import { Box, getContrastRatio } from '@mui/system'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import React, { useRef, useState } from 'react'
import { use100vh } from 'react-div-100vh'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { SpringEvent } from 'react-spring-bottom-sheet/dist/types'
import { FilterDetail } from '../components/FilterDetail'
import { createMarkers, MarkerClickHandler, updateMarkersIconAndVisibility } from '../components/marker'
import { NurseryDetail } from '../components/NurseryDetail'
import { NurserySchool } from '../lib/model/nursery-school'
import { getAllNurserySchoolListSets, LocalNurserySchoolListSet } from '../lib/model/nursery-school-list'
import { useIsomorphicLayoutEffect } from '../utils/useIsomorhpicLayoutEffect'

const DEFAULT_CENTER = { lat: 35.654291, lng: 139.750533 }
const DEFAULT_ZOOM = 15

interface Props {
  nurserySets: LocalNurserySchoolListSet[]
}

export interface FilterProps {
  ageList: number[] | null // 指定なしの場合はnull
}

type BottomSheetKind = 'filter' | 'detail'

export default function Home({ nurserySets }: Props) {
  const [detail, setDetail] = useState<{
    nursery: NurserySchool
    inNurserySet: LocalNurserySchoolListSet
    marker: google.maps.Marker
  } | null>(null)
  const [filter, setFilter] = useState<FilterProps>({ ageList: null })
  const [snackbarState, setSnackbarState] = useState<
    (Pick<SnackbarProps, 'open' | 'message'> & Pick<AlertProps, 'severity'>) | null
  >(null)

  const [bottomSheetState, setBottomSheetState] = useState<{
    current?: BottomSheetKind
    open: boolean
  }>({ open: false })
  // Clicking other element will also triggers BottomSheet dismiss. So no explicit close is required here.
  const openBottomSheet = (kind: BottomSheetKind) => {
    setBottomSheetState(() => ({ current: kind, open: true }))
  }
  const closeBottomSheet = () => {
    setBottomSheetState(s => ({ ...s, open: false }))
  }

  const theme = useTheme()

  const pageHeight = use100vh()

  const mapRef = useRef<google.maps.Map>(null)

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <CircularProgress />
      case Status.FAILURE:
        return (
          <Stack direction="column" spacing={2} alignItems="center">
            <ErrorIcon color="disabled" fontSize="large" />
            <Typography color="text.secondary">エラーが発生しました</Typography>
          </Stack>
        )
      case Status.SUCCESS:
        return (
          <MyMapComponent
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            nurserySets={nurserySets}
            filter={filter}
            mapRef={mapRef}
            onClickMarker={({ nursery, inNurserySet, marker }) => {
              resetMarker()

              setDetail({ nursery, inNurserySet, marker })
              openBottomSheet('detail')

              // TODO: hack
              const markerIcon = marker.getIcon() as google.maps.Symbol
              marker.setIcon({ ...markerIcon, scale: 2 })
              const chipBgColor = markerIcon.fillColor!
              let chipTextColor = markerIcon.strokeColor!
              if (getContrastRatio(chipTextColor, chipBgColor) < theme.palette.contrastThreshold) {
                chipTextColor = '#fff'
              }
              marker.setLabel({ text: nursery.name[0], color: chipTextColor, fontSize: '32px' })
            }}
          />
        )
    }
  }

  const handleFilterClose = () => {
    setFilter({ ...filter })
    closeBottomSheet()
  }

  const handleDetailClose = () => {
    if (!detail) return

    setDetail({ ...detail })
    resetMarker()
    closeBottomSheet()
  }

  const resetMarker = () => {
    if (!detail) return

    const marker = detail.marker
    // TODO: hack
    const markerIcon = marker.getIcon() as google.maps.Symbol
    marker.setIcon({ ...markerIcon, scale: 1 })
    detail.marker.setLabel(null)
  }

  const [locationActive, setLocationActive] = useState(false)

  const handleLocation = () => {
    if (locationActive) return
    setLocationActive(true)

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        mapRef.current?.setCenter(pos)
        mapRef.current?.setZoom(DEFAULT_ZOOM)
        setLocationActive(false)
      },
      () => {
        setSnackbarState({ open: true, severity: 'warning', message: '位置情報の取得に失敗しました' })
        setLocationActive(false)
      }
    )
  }

  const handleSnackbarClose = () => setSnackbarState(s => ({ ...s, open: false }))

  return (
    <>
      <Head>
        <title>入りやすい保育園マップ</title>
        <meta name="description" content="入所最低指数をもとに、保育園の入りやすさを色分けして地図に表示します。" />
      </Head>

      <Stack sx={{ width: '100%', height: pageHeight }}>
        <AppBar color="inherit" elevation={0} position="static">
          <Toolbar variant="dense">
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexGrow={1}>
              <img src="/logo.svg" alt="入りやすい保育園マップ" />
              <Stack direction="row" spacing={1}>
                <Typography variant="caption" color="gray">
                  港,台東,中央区に対応
                </Typography>
                <Link
                  color="primary"
                  underline="none"
                  href="https://amenable-barber-8a3.notion.site/27727efccef7426a8f69d161089a3d28"
                  target="_blank"
                >
                  <HelpOutlinedIcon fontSize="small" />
                </Link>
              </Stack>
            </Stack>
          </Toolbar>
          <Divider />
        </AppBar>

        <FilterButton
          filter={filter}
          locationActive={locationActive}
          onClickFilter={() => {
            setFilter({ ageList: filter.ageList })
            openBottomSheet('filter')
          }}
          onClickLocation={handleLocation}
        />

        <div
          className="no-outline"
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Wrapper apiKey="AIzaSyAQtZaDCQybQWgd-uOQD-jN7vJnontAXtY" render={render} />
        </div>
      </Stack>

      <BottomSheet
        open={bottomSheetState.open}
        onDismiss={handleDetailClose}
        style={
          {
            '--rsbs-backdrop-bg': 'transparent',
          } as any
        }
        scrollLocking={false}
      >
        {bottomSheetState.current === 'filter' && filter && (
          <FilterDetail filter={filter} setFilter={setFilter} onClose={handleFilterClose} />
        )}

        {bottomSheetState.current === 'detail' && detail && (
          <NurseryDetail
            nursery={detail.nursery}
            inNurserySet={detail.inNurserySet}
            filter={filter}
            onClose={handleDetailClose}
          />
        )}
      </BottomSheet>

      {snackbarState && (
        <Snackbar open={snackbarState.open} onClose={handleSnackbarClose} message={snackbarState.message}>
          <Alert variant="filled" severity={snackbarState.severity} onClose={handleSnackbarClose}>
            {snackbarState.message}
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

function FilterButton({
  filter,
  locationActive,
  onClickFilter,
  onClickLocation,
}: {
  filter: FilterProps
  locationActive: boolean
  onClickFilter: () => void
  onClickLocation: () => void
}) {
  const theme = useTheme()

  const buttonText = (filter: FilterProps): string => {
    if (filter.ageList === null) {
      return '子どもの年齢 指定なし'
    }
    if (filter.ageList.length === 6) {
      return '子どもの年齢 すべて'
    }
    return (
      '子どもの年齢 ' +
      filter.ageList
        .sort((a, b) => a - b)
        .map(age => `${age}歳`)
        .join(', ')
    )
  }

  return (
    <Paper
      elevation={1}
      sx={{ borderRadius: 1000, paddingX: 1, position: 'absolute', top: '60px', left: '10px', zIndex: 1 }}
    >
      <Stack
        direction="row"
        spacing={1}
        divider={
          <Divider
            orientation="vertical"
            flexItem
            style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }}
          />
        }
      >
        {/* <Button color="primary">2022年4月入園</Button> */}
        <Button sx={{ color: theme.palette.primary.contrastText }} onClick={onClickFilter}>
          {buttonText(filter)}
        </Button>
        <Button
          sx={{ color: theme.palette.primary.contrastText }}
          startIcon={locationActive ? <CircularProgress size={16} sx={{ marginBottom: '2px' }} /> : undefined}
          onClick={onClickLocation}
        >
          現在地へ移動
        </Button>
      </Stack>
    </Paper>
  )
}

function MyMapComponent({
  center,
  zoom,
  nurserySets,
  filter,
  mapRef: mapRefProp,
  onClickMarker,
}: {
  center: google.maps.LatLngLiteral
  zoom: number
  nurserySets: LocalNurserySchoolListSet[]
  filter: FilterProps
  mapRef?: React.RefObject<google.maps.Map>
  onClickMarker: MarkerClickHandler
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map>()
  const markersRef = useRef<google.maps.Marker[]>([])
  const clickHandlerRef = useRef(onClickMarker)

  useIsomorphicLayoutEffect(() => {
    if (mapRef.current) return

    mapRef.current = new google.maps.Map(ref.current!, {
      gestureHandling: 'greedy',
      disableDefaultUI: true,
      zoomControl: true,
    })
    // there is no way to dispose it
    // https://stackoverflow.com/questions/10485582/what-is-the-proper-way-to-destroy-a-map-instance
  }, [])

  useIsomorphicLayoutEffect(() => {
    if (!mapRefProp) return
    const mMapRefProp = mapRefProp as React.MutableRefObject<google.maps.Map | null>
    mMapRefProp.current = mapRef.current!
    return () => {
      mMapRefProp.current = null
    }
  }, [mapRefProp])

  useIsomorphicLayoutEffect(() => {
    mapRef.current!.setCenter({ lat: center.lat, lng: center.lng })
    mapRef.current!.setZoom(zoom)
  }, [center.lat, center.lng, zoom])

  useIsomorphicLayoutEffect(() => {
    markersRef.current = createMarkers(mapRef.current!, nurserySets, params => clickHandlerRef.current(params))

    return () => {
      markersRef.current.forEach(m => m.setMap(null))
    }
  }, [nurserySets])

  useIsomorphicLayoutEffect(() => {
    clickHandlerRef.current = onClickMarker
  }, [onClickMarker])

  useIsomorphicLayoutEffect(() => {
    updateMarkersIconAndVisibility(markersRef.current, nurserySets, filter)
  }, [nurserySets, filter.ageList])

  return <Box ref={ref} id="map" sx={{ width: '100%', height: '100%' }} />
}

export const getStaticProps: GetStaticProps<Props> = () => {
  return {
    props: {
      nurserySets: getAllNurserySchoolListSets(),
    },
  }
}
