import { Status, Wrapper } from '@googlemaps/react-wrapper'
import ErrorIcon from '@mui/icons-material/Error'
import { AppBar, Button, CircularProgress, Divider, Paper, Stack, Toolbar, Typography, useTheme } from '@mui/material'
import { Box, getContrastRatio } from '@mui/system'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRef, useState } from 'react'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { createMarkers, MarkerClickHandler } from '../components/marker'
import { NurseryDetail } from '../components/NurseryDetail'
import { NurserySchool } from '../lib/model/nursery-school'
import { getAllNurserySchoolListSets, LocalNurserySchoolListSet } from '../lib/model/nursery-school-list'
import { useIsomorphicLayoutEffect } from '../utils/useIsomorhpicLayoutEffect'
import { FilterDetail } from '../components/FilterDetail'

interface Props {
  nurserySets: LocalNurserySchoolListSet[]
}

export interface FilterProps {
  ageList: number[] | null // 指定なしの場合はnull
  open: boolean
}

const useForceUpdate = (): [() => void, number] => {
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);
  return [increment, count];
};

export default function Home({ nurserySets }: Props) {
  const [detail, setDetail] = useState<{
    nursery: NurserySchool
    inNurserySet: LocalNurserySchoolListSet
    marker: google.maps.Marker
    open: boolean
  } | null>(null)

  const [filter, setFilter] = useState<FilterProps>({ ageList: null, open: false })
  const [forceUpdate] = useForceUpdate()

  const theme = useTheme()

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <CircularProgress />
      case Status.FAILURE:
        return (
          <Stack direction="column" spacing={4} alignItems="center">
            <ErrorIcon />
            <Typography color="text.secondary">エラーが発生しました</Typography>
          </Stack>
        )
      case Status.SUCCESS:
        return (
          <MyMapComponent
            center={{ lat: 35.654291, lng: 139.750533 }}
            zoom={15}
            nurserySets={nurserySets}
            filter={filter}
            onClickMarker={({ nursery, inNurserySet, marker }) => {
              resetMarker()

              setDetail({ nursery, inNurserySet, marker, open: true })
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
    setFilter({ ...filter, open: false })
    forceUpdate()
  }

  const handleDetailClose = () => {
    if (!detail || !detail.open) return

    setDetail({ ...detail, open: false })
    resetMarker()
  }

  const resetMarker = () => {
    if (!detail) return

    const marker = detail.marker
    // TODO: hack
    const markerIcon = marker.getIcon() as google.maps.Symbol
    marker.setIcon({ ...markerIcon, scale: 1 })
    detail.marker.setLabel(null)
  }

  return (
    <>
      <Head>
        <title>入りやすい保育園マップ</title>
        <meta name="description" content="入所最低指数をもとに、保育園の入りやすさを色分けして地図に表示します。" />
      </Head>

      <Stack sx={{ width: '100%', height: '100vh' }}>
        <AppBar color="inherit" elevation={0} position="static">
          <Toolbar variant="dense">
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexGrow={1}>
              <Typography variant="subtitle1" component="h1">
                入りやすい保育園マップ
              </Typography>
              <Typography variant="body2" color="gray">
                港区限定で公開中
              </Typography>
            </Stack>
          </Toolbar>
          <Divider />
        </AppBar>

        <FilterButton filter={filter} onClickFilter={ () => {
          setFilter({ ageList: filter.ageList, open: true })
        } } />

        {/* FIXME: filterの更新が反映されない */}
        <Wrapper apiKey="AIzaSyAQtZaDCQybQWgd-uOQD-jN7vJnontAXtY" render={render} />
      </Stack>

      {filter.open && (
        <BottomSheet
          open={filter.open}
          onDismiss={handleFilterClose}
          blocking={true}
          style={
            {
              '--rsbs-backdrop-bg': 'rgba(0, 0, 0, 0.2)',
              '--rsbs-overlay-rounded': 0,
            } as any
          }
        >
          <FilterDetail filter={filter} setFilter={setFilter} onClose={handleFilterClose} />
        </BottomSheet>
      )}

      {detail && (
        <BottomSheet
          open={detail.open}
          onDismiss={handleDetailClose}
          blocking={false}
          style={
            {
              '--rsbs-backdrop-bg': 'rgba(0, 0, 0, 0.2)',
              '--rsbs-overlay-rounded': 0,
            } as any
          }
        >
          <NurseryDetail nursery={detail.nursery} inNurserySet={detail.inNurserySet} filter={filter} onClose={handleDetailClose} />
        </BottomSheet>
      )}
    </>
  )
}

function FilterButton({
  filter,
  onClickFilter
}: {
  filter: FilterProps
  onClickFilter: () => void
}) {
  const theme = useTheme()

  const buttonText = (filter: FilterProps): string => {
    if (filter.ageList === null) {
      return '子どもの年齢 指定なし'
    }
    if (filter.ageList.length === 6) {
      return '子どもの年齢 すべて'
    }
    return '子どもの年齢 ' + filter.ageList
      .sort((a, b) => a - b)
      .map((age) => `${age}歳`)
      .join(', ')
  }

  return (
    <Paper elevation={1} sx={{ borderRadius: 1000, paddingX: 1, position: 'absolute', top: '60px', left: '10px', zIndex: 1}}>
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
        <Button color="primary" onClick={onClickFilter}>{buttonText(filter)}</Button>
      </Stack>
    </Paper>
  )
}

function MyMapComponent({
  center,
  zoom,
  nurserySets,
  filter,
  onClickMarker,
}: {
  center: google.maps.LatLngLiteral
  zoom: number
  nurserySets: LocalNurserySchoolListSet[]
  filter: FilterProps
  onClickMarker: MarkerClickHandler
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map>()
  const markersRef = useRef<google.maps.Marker[]>([])
  const clickHandlerRef = useRef(onClickMarker)

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return
    if (mapRef.current) return

    mapRef.current = new google.maps.Map(ref.current, {
      center: { lat: center.lat, lng: center.lng },
      zoom,
      gestureHandling: 'greedy',
      disableDefaultUI: true,
      zoomControl: true,
    })
  }, [center.lat, center.lng, zoom])

  useIsomorphicLayoutEffect(() => {
    markersRef.current = createMarkers(mapRef.current!, nurserySets, filter, params => clickHandlerRef.current(params))

    return () => {
      markersRef.current.forEach(m => m.setMap(null))
    }
  }, [nurserySets])

  useIsomorphicLayoutEffect(() => {
    clickHandlerRef.current = onClickMarker
  }, [onClickMarker])

  useIsomorphicLayoutEffect(() => {
    markersRef.current.forEach((marker) => {
      marker.setMap(null)
    })
    markersRef.current = []
    markersRef.current = createMarkers(mapRef.current!, nurserySets, filter, params => clickHandlerRef.current(params))

  }, [filter.ageList])

  return <Box ref={ref} id="map" sx={{ width: '100%', height: '100%' }} />
}

export const getStaticProps: GetStaticProps<Props> = () => {
  return {
    props: {
      nurserySets: getAllNurserySchoolListSets(),
    },
  }
}
