import { Stack, Typography, IconButton, FormGroup, FormControlLabel, Checkbox, FormLabel } from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { Dispatch, SetStateAction } from "react";
import { FilterProps } from "../pages";
import { fontSize } from "@mui/system";

const updateFilter = (age: number, value: boolean, filter: FilterProps, setFilter: Dispatch<SetStateAction<FilterProps>>) => {
  var newAgeList: number[] | null = []
  if (value) {
    newAgeList = (filter.ageList || []).concat([age])
  } else {
    newAgeList = (filter.ageList || []).filter(it => it !== age)
  }
  if (newAgeList.length === 0) {
    newAgeList = null
  }
  setFilter({ ageList: newAgeList })
}

export function FilterDetail({
  filter,
  setFilter,
  onClose,
}: {
  filter: FilterProps
  setFilter: Dispatch<SetStateAction<FilterProps>>
  onClose: () => void
}) {
  return (
    <Stack direction="column" spacing={3} sx={{ padding: 2, paddingTop: 0 }}>
      <div>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ marginLeft: '-1px' /* Optical Adjustment */ }}>
            {'子どもの年齢'}
          </Typography>
          <div>
            <IconButton edge="end" onClick={() => onClose()}>
              <CloseRoundedIcon />
            </IconButton>
          </div>
        </Stack>
      </div>

      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={filter.ageList?.includes(0) || false}
              onChange={(event)=>{
                updateFilter(0, event.target.checked, filter, setFilter)
              }}
            />
          }
          label="0歳　(2021/4/2 〜 2022/4/1 生まれ)" 
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filter.ageList?.includes(1) || false}
              onChange={(event)=>{
                updateFilter(1, event.target.checked, filter, setFilter)
              }}
            />
          }
          label="1歳　(2020/4/2 〜 2021/4/1 生まれ)" 
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filter.ageList?.includes(2) || false}
              onChange={(event)=>{
                updateFilter(2, event.target.checked, filter, setFilter)
              }}
            />
          }
          label="2歳　(2019/4/2 〜 2020/4/1 生まれ)" 
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filter.ageList?.includes(3) || false}
              onChange={(event)=>{
                updateFilter(3, event.target.checked, filter, setFilter)
              }}
            />
          }
          label="3歳　(2018/4/2 〜 2019/4/1 生まれ)" 
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filter.ageList?.includes(4) || false}
              onChange={(event)=>{
                updateFilter(4, event.target.checked, filter, setFilter)
              }}
            />
          }
          label="4歳　(2017/4/2 〜 2018/4/1 生まれ)" 
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filter.ageList?.includes(5) || false}
              onChange={(event)=>{
                updateFilter(5, event.target.checked, filter, setFilter)
              }}
            />
          }
          label="5歳　(2016/4/2 〜 2017/4/1 生まれ)" 
        />  
      </FormGroup>
    </Stack>
  )
}