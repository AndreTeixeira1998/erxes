// get config options for react-select
export function selectConfigOptions(array: string[] = [], CONSTANT: any) {
  return array.map(item => ({
    value: item,
    label: CONSTANT.find(el => el.value === item).label
  }));
}
