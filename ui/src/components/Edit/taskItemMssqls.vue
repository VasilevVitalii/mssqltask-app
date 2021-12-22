<template>
    <q-btn-dropdown
        flat
        dense
        size="sm"
        color="primary"
        label="change"
        style="margin: 2px 0px 0px 0px"
        @focus=";[list.splice(0, list.length), list.push(...buildList())]">
        <div style="width: calc(100vw / 1.5); height: calc(100vh / 2); overflow-y: hidden; overflow-x: hidden; margin: 10px">
            <q-input dense v-model="filter" borderless label="filter" style="margin: 10px">
                <template v-slot:prepend>
                    <q-icon name="search" />
                </template>
            </q-input>

            <div style="display: flex; flex-flow: wrap">
                <div v-for="(item, idx) in filteredList" :key="idx">
                    <q-checkbox v-model="item.selected" :label="item.title()" />
                </div>
            </div>
        </div>
    </q-btn-dropdown>
</template>
<script lang="ts">
import { PropType, defineComponent, ref, reactive, computed } from "vue"
import { TTask, state } from "@/state/edit"
import * as vv from "vv-common"

export default defineComponent({
    props: {
        item: {
            type: Object as PropType<TTask>,
            required: true
        }
    },
    setup(props) {
        class Item {
            readonly type: "tag" | "instance"
            readonly key: string
            private _title: string
            private _selected: boolean

            constructor(type: "tag" | "instance", key: string, title: string, selected: boolean) {
                this.type = type
                this.key = key
                this._title = title
                this._selected = selected
                if (!this._title && this.type === "instance") {
                    this._title = state.mssqls.find(f => vv.equal(f.item.state.instance, this.key))?.item.state.title || this.key
                }
            }

            title() {
                if (this._title === this.key) {
                    return `${this.type} - ${this._title}`
                } else {
                    return `${this.type} - ${this._title} (${this.key})`
                }
            }

            get selected(): boolean {
                return this._selected
            }
            set selected(value: boolean) {
                const mssqls = props.item.item.state.mssqls
                if (value === true) {
                    if (this.type === "tag") {
                        mssqls.tags.push(this.key)
                    } else if (this.type === "instance") {
                        mssqls.instances.push(this.key)
                    }
                } else if (value === false) {
                    if (this.type === "tag") {
                        let i = mssqls.tags.findIndex(f => vv.equal(f, this.key))
                        while (i >= 0) {
                            mssqls.tags.splice(i, 1)
                            i = mssqls.tags.findIndex(f => vv.equal(f, this.key))
                        }
                    } else if (this.type === "instance") {
                        let i = mssqls.instances.findIndex(f => vv.equal(f, this.key))
                        while (i >= 0) {
                            mssqls.instances.splice(i, 1)
                            i = mssqls.instances.findIndex(f => vv.equal(f, this.key))
                        }
                    }
                }
                this._selected = value
            }
        }

        const buildList = (): Item[] => {
            const list: Item[] = []

            props.item.item.state.mssqls.tags.forEach(t => {
                if (list.some(f => f.type === "tag" && vv.equal(f.key, t))) return
                list.push(new Item("tag", t, t, true))
            })
            props.item.item.state.mssqls.instances.forEach(t => {
                if (list.some(f => f.type === "instance" && vv.equal(f.key, t))) return
                list.push(new Item("instance", t, "", true))
            })
            state.mssqls.forEach(mssql => {
                mssql.item.state.tags.forEach(t => {
                    if (list.some(f => f.type === "tag" && vv.equal(f.key, t))) return
                    list.push(new Item("tag", t, t, false))
                })

                if (list.some(f => f.type === "instance" && vv.equal(f.key, mssql.item.state.instance))) return
                list.push(new Item("instance", mssql.item.state.instance, mssql.item.state.title || mssql.item.state.instance, false))
            })

            return list.sort((a, b) => {
                if (a.selected && !b.selected) return -1
                if (!a.selected && b.selected) return 1
                if (a.type === "tag" && b.type === "instance") return -1
                if (a.type === "instance" && b.type === "tag") return 1
                if (a.title > b.title) return 1
                if (a.title < b.title) return -1
                return 0
            })
        }

        const list = reactive([]) as unknown as Item[]
        const filter = ref("")
        const filteredList = computed(() => {
            const find = (filter.value || "")
                .split(" ")
                .map(m => {
                    return m.trim().toLowerCase()
                })
                .filter(f => f.length > 0)
            if (find.length <= 0) {
                return list
            } else {
                return list.filter(f => find.every(ff => f.title().toLowerCase().indexOf(ff) >= 0))
            }
        })

        return {
            mode: ref("exists"),
            filter,
            mssqls: props.item.item.state.mssqls,
            buildList,
            list,
            filteredList
        }
    }
})
</script>
