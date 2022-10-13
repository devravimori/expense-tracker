<script setup>
import { onMounted, reactive, ref } from "vue";
import VueApexCharts from "vue3-apexcharts";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/vue";
import { v4 as uuid, validate } from "uuid";

const isOpen = ref(false);
const $page = reactive({
  record: [],
  form: {
    _id: "",
    title: "",
    amount: "",
    type: "ex",
  },
  edit: false,
  expense: 0,
  income: 0,
  thisMonth: 0,
  thisMonthIn: 0,
  total: 0,
  sort: "asc",
  error: false,
  preview: "table",
  series: [1, 1],
  series2: [1, 1],
  chartOptions: {
    chart: {
      width: 380,
      type: "pie",
    },
    labels: ["Income", "Expense"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    colors: ["#39b73f", "#ff9f40"],
  },
  chartOptions2: {
    chart: {
      width: 380,
      type: "pie",
    },
    labels: ["Income", "Expense"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    colors: ["#39b73f", "#ff9f40"],
  },
});

onMounted(() => {
  $page.record = getRecord() || [];

  $page.expense = $page.record.reduce((t, c) => {
    if (c.type === "ex") {
      t += c.amount;
    }
    return t;
  }, 0);
  $page.income = $page.record.reduce((t, c) => {
    if (c.type === "in") {
      t += c.amount;
    }
    return t;
  }, 0);

  let thisMonthRecord = $page.record.filter((i) => {
    return (
      new Date().getMonth() == new Date(i.created_at).getMonth() &&
      i.type === "ex"
    );
  });
  $page.thisMonth = thisMonthRecord.reduce((t, c) => {
    return (t += c.amount);
  }, 0);

  let thisMonthIncome = $page.record.filter((i) => {
    return (
      new Date().getMonth() == new Date(i.created_at).getMonth() &&
      i.type === "in"
    );
  });
  $page.thisMonthIn = thisMonthIncome.reduce((t, c) => {
    return (t += c.amount);
  }, 0);
  $page.series = [$page.income, $page.expense];
  $page.series2 = [$page.thisMonthIn, $page.thisMonth];
  $page.total = $page.income - $page.expense;
});

const rmRecord = (id) => {
  $page.record = $page.record.filter((i) => {
    return i._id !== id;
  });
  updateState();
  setRecord($page.record);
};

const getRecord = () => {
  let record = window.localStorage.getItem("record");
  if ($page.sort !== "asc") {
    return JSON.parse(record).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }
  return JSON.parse(record);
};

const setRecord = (record) => {
  record = JSON.stringify(record);
  window.localStorage.setItem("record", record);
};

const closeModal = () => {
  isOpen.value = false;
  setTimeout(() => {
    $page.edit = false;
    updateState();
  }, 500);
};
const openModal = (editId = null) => {
  if (editId) {
    let [record] = $page.record.filter((i) => {
      return i._id === editId;
    });
    $page.edit = true;
    $page.form._id = editId;
    $page.form.title = record.title;
    $page.form.amount = record.amount;
    $page.form.type = record.type;
  }
  isOpen.value = true;
};

const saveRecord = () => {
  if ($page.form.title === "" || $page.form.amount === "") {
    $page.error = true;
    return;
  }
  if (!$page.form._id) $page.form._id = uuid();

  $page.record.push({
    _id: $page.form._id,
    title: $page.form.title,
    amount: $page.form.amount,
    type: $page.form.type,
    created_at: new Date().toLocaleString(),
  });
  setRecord($page.record);
  closeModal();
};
const updateRecord = () => {
  if ($page.form.title === "" || $page.form.amount === "") {
    $page.error = true;
    return;
  }
  $page.record.map((i, index) => {
    if (i._id === $page.form._id) {
      Object.assign($page.form, {
        created_at: i.created_at,
      });
      $page.record[index] = { ...$page.form };
      setRecord($page.record);
    }
  });

  closeModal();
};

const updateState = () => {
  $page.expense = $page.record.reduce((t, c) => {
    if (c.type === "ex") {
      t += c.amount;
    }
    return t;
  }, 0);
  $page.income = $page.record.reduce((t, c) => {
    if (c.type === "in") {
      t += c.amount;
    }
    return t;
  }, 0);

  let thisMonthRecord = $page.record.filter((i) => {
    return (
      new Date().getMonth() == new Date(i.created_at).getMonth() &&
      i.type === "ex"
    );
  });
  $page.thisMonth = thisMonthRecord.reduce((t, c) => {
    return (t += c.amount);
  }, 0);

  let thisMonthIncome = $page.record.filter((i) => {
    return (
      new Date().getMonth() == new Date(i.created_at).getMonth() &&
      i.type === "in"
    );
  });
  $page.thisMonthIn = thisMonthIncome.reduce((t, c) => {
    return (t += c.amount);
  }, 0);
  $page.series = [$page.income, $page.expense];
  $page.series2 = [$page.thisMonthIn, $page.thisMonth];

  $page.total = $page.income - $page.expense;

  $page.error = false;

  $page.form._id = null;
  $page.form.title = "";
  $page.form.amount = "";
  $page.form.type = "ex";
  // $page.series = [$page.income, $page.expense];
};

const sort = (t = false) => {
  $page.sort = t ? "asc" : "desc";
  $page.record = getRecord() || [];
};
</script>

<template>
  <div class="w-full lg:h-28 grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="h- w-full bg-blue-500 text-white border rounded-md py-5 px-5">
      <h1 class="text-lg">Expense</h1>
      <h3 class="lining-nums text-2xl">${{ $page.expense }}</h3>
    </div>
    <div class="h- w-full bg-white border rounded-md py-5 px-5">
      <h1 class="text-lg">This month</h1>
      <h3 class="lining-nums text-2xl">${{ $page.thisMonth }}</h3>
    </div>
    <div class="h- w-full bg-white border rounded-md py-5 px-5">
      <h1 class="text-lg">Income</h1>
      <h3 class="lining-nums text-2xl">${{ $page.income }}</h3>
    </div>
    <div class="h- w-full bg-white border rounded-md py-5 px-5">
      <h1 class="text-lg">Total</h1>
      <h3 class="lining-nums text-2xl">${{ +$page.total }}</h3>
    </div>
  </div>
  <div class="mt-6">
    <div class="border-b border-slate-200">
      <button
        @click="$page.preview = 'table'"
        :class="[
          $page.preview === 'table' ? 'border-blue-500' : 'border-transparent',
        ]"
        class="text-sm py-1.5 px-5 border-b-2"
      >
        Table
      </button>
      <button
        @click="$page.preview = 'chart'"
        :class="[
          $page.preview === 'chart' ? 'border-blue-500' : 'border-transparent',
        ]"
        class="text-sm py-1.5 px-5 border-b-2"
      >
        Chart
      </button>
    </div>
    <template v-if="$page.preview === 'table'">
      <div>
        <div class="mt-5 flex justify-between items-center">
          <Menu as="div" class="relative inline-block text-right">
            <div>
              <MenuButton
                class="py-1.5 px-4 border rounded-md bg-white flex items-center"
              >
                <span class="inline-block mr-2">Sort</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </MenuButton>
            </div>

            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <MenuItems
                class="absolute z-[9999] left-0 p-1 mt-2 w-28 origin-top-left divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <MenuItem v-slot="{ active }">
                  <button
                    @click="sort(true)"
                    :class="[
                      'group flex w-full items-center px-2 rounded py-1',
                      $page.sort === 'asc' && 'bg-blue-500 text-white',
                    ]"
                  >
                    Latest
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="sort()"
                    :class="[
                      'group flex w-full items-center px-2 rounded py-1',
                      $page.sort !== 'asc' && 'bg-blue-500 text-white',
                    ]"
                  >
                    Oldest
                  </button>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
          <button
            @click="openModal()"
            class="py-1.5 px-4 border rounded-md bg-blue-500 text-white flex items-center"
          >
            <span class="inline-block mr-1.5">Add item</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v12m6-6H6"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="mt-4 w-full">
        <div class="overflow-x-auto relative border sm:rounded-lg">
          <table class="w-full text-sm text-left">
            <thead class="text-slate-600 bg-gray-50">
              <tr class="border-b">
                <th scope="col" class="py-3 px-6">Title</th>
                <th scope="col" class="py-3 px-6">Amount</th>
                <th scope="col" class="py-3 px-6">Date</th>
                <th scope="col" class="py-3 px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="$page.record.length > 0">
                <tr
                  v-for="item in $page.record"
                  :key="item"
                  class="bg-white border-b"
                >
                  <th
                    scope="row"
                    class="py-4 px-6 font-medium text-slate-900 whitespace-nowrap"
                  >
                    {{ item.title }}
                  </th>
                  <td
                    class="py-4 px-6"
                    :class="
                      item.type === 'ex' ? 'text-red-600' : 'text-green-600'
                    "
                  >
                    <span v-if="item.type === 'ex'">-</span>
                    <span v-else>+</span>
                    ${{ item.amount }}
                  </td>
                  <th scope="row" class="py-4 px-6 font-normal">
                    {{ item.created_at }}
                  </th>
                  <td class="py-4 px-6">
                    <button
                      @click="openModal(item._id)"
                      class="font-medium text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      @click="rmRecord(item._id)"
                      class="font-medium text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td colspan="4" class="py-4 px-6 font-normal bg-white">
                    <h1>Record not found</h1>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4" v-if="$page.record.length > 0">
        <div class="px-5 py-3 bg-white rounded-md w-full mt-5 border">
          <h1 class="text-slate-700">Total</h1>
          <VueApexCharts
            width="500"
            type="donut"
            :options="$page.chartOptions"
            :series="$page.series"
          ></VueApexCharts>
        </div>
        <div class="px-5 py-3 bg-white rounded-md w-full mt-5 border">
          <h1 class="text-slate-700">This month</h1>
          <VueApexCharts
            width="500"
            type="donut"
            :options="$page.chartOptions2"
            :series="$page.series2"
          ></VueApexCharts>
        </div>
      </div>
      <div class="flex h-40 py-5 justify-center items-center" v-else>Record not found</div>
    </template>
  </div>

  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-xl transform overflow-hidden rounded-lg bg-white px-6 py-4 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 mb-2"
              >
                Add Item
              </DialogTitle>
              <div class="mt-2">
                <p v-if="$page.error" class="text-sm text-red-500">
                  All fields must be require
                </p>
                <div class="mb-3">
                  <label class="text-gray-700" for="title">Title</label>
                  <input
                    v-model="$page.form.title"
                    class="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    type="text"
                    id=""
                  />
                </div>
                <div class="mb-3">
                  <label class="text-gray-700" for="title">Amount</label>
                  <input
                    v-model="$page.form.amount"
                    class="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    type="number"
                    id=""
                  />
                </div>
                <div class="mb-3">
                  <input
                    class="mr-1"
                    v-model="$page.form.type"
                    type="radio"
                    id="in"
                    value="in"
                  />
                  <label class="mr-2" for="in">Income</label>
                  <input
                    class="mr-1"
                    v-model="$page.form.type"
                    type="radio"
                    id="ex"
                    value="ex"
                  />
                  <label class="mr-2" for="ex">Expense</label>
                </div>
              </div>

              <div class="mt-4 flex justify-end items-center">
                <button
                  @click="closeModal"
                  class="py-1.5 px-4 border rounded-md bg-white text-slate-700 mr-3"
                >
                  <span class="inline-block">Cancel</span>
                </button>
                <button
                  v-if="$page.edit"
                  @click="updateRecord"
                  class="py-1.5 px-4 border rounded-md bg-blue-500 text-white"
                >
                  <span class="inline-block">Update</span>
                </button>
                <button
                  v-else
                  @click="saveRecord"
                  class="py-1.5 px-4 border rounded-md bg-blue-500 text-white"
                >
                  <span class="inline-block">Save</span>
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
