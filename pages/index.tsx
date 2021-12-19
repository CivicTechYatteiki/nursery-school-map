import { Status, Wrapper } from '@googlemaps/react-wrapper'
import ErrorIcon from '@mui/icons-material/Error'
import { AppBar, Button, CircularProgress, Divider, Paper, Stack, Toolbar, Typography, useTheme } from '@mui/material'
import { Box } from '@mui/system'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRef, useState } from 'react'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { createMarkers, MarkerClickHandler } from '../components/marker'
import { NurseryDetail } from '../components/NurseryDetail'
import { NurserySchool } from '../lib/model/nursery-school'
import { getAllNurserySchoolListSets, LocalNurserySchoolListSet } from '../lib/model/nursery-school-list'
import { useIsomorphicLayoutEffect } from '../utils/useIsomorhpicLayoutEffect'

interface Props {
  nurserySets: LocalNurserySchoolListSet[]
}

export default function Home({ nurserySets }: Props) {
  const [detail, setDetail] = useState<{
    nursery: NurserySchool
    inNurserySet: LocalNurserySchoolListSet
    open: boolean
  } | null>(null)

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
            onClickMarker={({ nursery, inNurserySet }) => setDetail({ nursery, inNurserySet, open: true })}
          />
        )
    }
  }

  const handleDetailClose = () => {
    setDetail(detail ? { ...detail, open: false } : null)
  }

  return (
    <>
      <Head>
        <title>入りやすい保育園マップ</title>
        <meta name="description" content="入所最低指数をもとに、保育園の入りやすさを色分けして地図に表示します。" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <AppBar color="inherit" elevation={0}>
        <Toolbar>
          <Typography component="h1" variant="h6">
            入りやすい保育園マップ
          </Typography>
          <Typography variant="body2" color="gray">
            港区限定で公開中
          </Typography>
          {/* <Filters /> */}
        </Toolbar>
      </AppBar>

      <Box sx={{ width: '100%', height: '100vh' }}>
        <Wrapper apiKey="AIzaSyAQtZaDCQybQWgd-uOQD-jN7vJnontAXtY" render={render} />
      </Box>

      {detail && (
        <BottomSheet open={detail.open} onDismiss={handleDetailClose}>
          <NurseryDetail nursery={detail.nursery} inNurserySet={detail.inNurserySet} />
        </BottomSheet>
      )}
    </>
  )
}

function Filters() {
  const theme = useTheme()

  return (
    <Paper elevation={1} sx={{ borderRadius: 1000, paddingX: 1 }}>
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
        <Button color="primary">2022年4月入園</Button>
        <Button color="primary">子どもの年齢指定なし</Button>
      </Stack>
    </Paper>
  )
}

function MyMapComponent({
  center,
  zoom,
  nurserySets,
  onClickMarker,
}: {
  center: google.maps.LatLngLiteral
  zoom: number
  nurserySets: LocalNurserySchoolListSet[]
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
    })
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

  return <Box ref={ref} id="map" sx={{ width: '100%', height: '100%' }} />
}

export const getStaticProps: GetStaticProps<Props> = () => {
  return {
    props: {
      nurserySets: getAllNurserySchoolListSets(),
    },
  }
}
