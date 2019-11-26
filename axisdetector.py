#-------------------------------------------------------------------------------
# Name:        train axises detector
# Purpose:
#
# Author:      LeoN
# Minor fixes: Moroseyan_Prophet
# Created:     15.08.2019
# Copyright:   (c) RockIT Studio 2019
# Licence:     <your licence>
#-------------------------------------------------------------------------------
import numpy as np
from scipy.signal import medfilt

def smooth(data, window = 10):
    w = np.bartlett(window * 2 + 1)
    return np.convolve(data, w / w.sum(), mode = 'same')

def med(data, window = 10):
    return np.array(medfilt(data, window * 2 + 1))

def diff(data):
    return np.diff(data)

def signal2edge(kick):
    edge = kick[:-1] != kick[1:]
    front = np.where(edge & kick[1:])
    back = np.where(edge & ~kick[1:])
    return front[0], back[0]

def edge2axis(edge):
    edge_front, edge_back = edge
    l = min(len(edge_front), len(edge_back))
    axis = (edge_front[:l] + edge_back[:l] + 1) // 2
    return axis

class AxisDetector():
    def __init__(self, length_platform = 3000.0, is_median = True):
        self.is_median = is_median
        self.length_platform = length_platform
        self.summary = []
        self.values = []
        self.k_treshs = np.array([0.07, 0.1, 0.15, 0.25, 0.35, 0.5, 0.7, 1, 1.5, 2, 3, 5])

    def tick(self, w_near_left, w_near_right, w_far_left, w_far_right):
        tick_values = [w_near_left, w_near_right, w_far_left, w_far_right]
        self.values.append(tick_values)

    def set_all_data(self, values):
        self.values = values

    def smooth_diff(self, data, key):
        if self.is_median:
            data_smooth = smooth(data, 20)
            self.data_diff[key] = med(diff(data_smooth), 20)
            self.data_diff_abs[key] = np.abs(self.data_diff[key])
        else:
            data_smooth = smooth(data, 40)
            self.data_diff[key] = diff(data_smooth)
            self.data_diff_abs[key] = np.abs(self.data_diff[key])

    def pre(self):
        self.values = np.array(self.values)
        self.summary = np.sum(self.values, axis=1)
        self.near = self.values[:, 0] + self.values[:, 1]
        self.far = self.values[:, 2] + self.values[:, 3]
        self.left = self.values[:, 0] + self.values[:, 2]
        self.right = self.values[:, 1] + self.values[:, 3]
        self.data_diff = {}
        self.data_diff_abs = {}
        self.smooth_diff(self.summary, 's')
        self.smooth_diff(self.left, 'l')
        self.smooth_diff(self.right, 'r')

    def analysis(self):
        self.pre()
        self.axis_counts = {'s' : [], 'l' : [], 'r' : []}
        for key in ['s', 'l', 'r']:
            for k_tresh in self.k_treshs:
                axis_in_count, axis_out_count = self.check(key, k_tresh, k_tresh)
                self.axis_counts[key].append((axis_in_count, axis_out_count))
            self.axis_counts[key] = np.array(self.axis_counts[key], dtype = 'int')
        k_in, k_out, axis_count = self.get_k_tresh(self.axis_counts['s'])
        k_in_l, k_out_l, _ = self.get_k_tresh(self.axis_counts['l'], axis_count)
        k_in_r, k_out_r, _ = self.get_k_tresh(self.axis_counts['r'], axis_count)
        self.check('l' if k_in_l > k_in_r else 'r', max(k_in_l, k_in_r), k_out, 'in')
        self.check('l' if k_out_l > k_out_r else 'r', k_in, max(k_out_l, k_out_r), 'out')
        assert len(self.axis_in) == len(self.axis_out), "Different number of in and out (%d, %d)" % (len(self.axis_in), len(self.axis_out))
        self.speed = self.length_platform * 1e-6 / ((self.axis_out - self.axis_in) * 0.01 / 3600)
        check_direction = self.left[self.axis_out] + self.right[self.axis_in] < self.right[self.axis_out] + self.left[self.axis_in]
        self.direction = sum(check_direction) > len(check_direction) * 0.5
        self.axis_len = (np.diff(self.axis_in)+np.diff(self.axis_out))*(self.speed[1:]+self.speed[:-1])/400*1000*1000/3600

    def check(self, key, k_tresh_in = 1, k_tresh_out = 1, mode = 'all'):
        self.k_tresh = k_tresh_in
        tresh_in = 1 + k_tresh_in * (np.mean(self.data_diff_abs[key]) + 15 * np.median(self.data_diff_abs[key]))
        tresh_out = 1 + k_tresh_out * (np.mean(self.data_diff_abs[key]) + 15 * np.median(self.data_diff_abs[key]))
        self.edge_in = signal2edge(self.data_diff[key] > tresh_in)
        self.edge_out = signal2edge(self.data_diff[key] < -tresh_out)
        if mode in ['all', 'in']:
            self.axis_in = edge2axis(self.edge_in)
        if mode in ['all', 'out']:
            self.axis_out = edge2axis(self.edge_out)
        #print(key, k_tresh_in, k_tresh_out, len(self.axis_in), len(self.axis_out))
        return len(self.axis_in), len(self.axis_out)

    def calc_weights(self):
        self.weights_all = []
        self.weights_near = []
        self.weights_far = []
        self.axis_all = np.concatenate([[0], self.axis_in, self.axis_out, [len(self.summary)-1]])
        self.axis_all.sort()
        for i in range(0, len(self.axis_all) - 1):
            idx = self.axis_all[i]
            idx_next = self.axis_all[i + 1]
            lenght = idx_next - idx
            len_pass = lenght // 10
            r = slice((idx + len_pass * 3), (idx_next - len_pass * 2))
            self.weights_near.append(self.near[r].mean())
            self.weights_far.append(self.far[r].mean())
            self.weights_all.append(self.summary[r].mean())
        self.weights_all.append(0)
        self.weights_all = np.array(self.weights_all)
        self.weights_near.append(0)
        self.weights_near = np.array(self.weights_near)
        self.weights_far.append(0)
        self.weights_far = np.array(self.weights_far)
        self.idx_in = np.isin(self.axis_all[1:], self.axis_in)
        self.idx_out = np.isin(self.axis_all[1:], self.axis_out)
        self.weights_diff = self.weights_all[1:] - self.weights_all[:-1]
        self.weights_in = self.weights_diff[self.idx_in]
        self.weights_out = self.weights_diff[self.idx_out]

    def get_k_tresh(self, axis_counts, axis_count = -1):
        if axis_count == -1:
            axis_counts_unique = np.unique(axis_counts, return_counts=True)
            axis_counts_unique[1][axis_counts_unique[0] == 0] = 0
            max_freq = axis_counts_unique[1].max()
            axis_count = axis_counts_unique[0][axis_counts_unique[1] == max_freq].max()
        ks = self.k_treshs[axis_counts[:,0] == axis_count]
        k_in = np.max(ks) if len(ks) > 0 else 0
        ks = self.k_treshs[axis_counts[:,1] == axis_count]
        k_out = np.max(ks) if len(ks) > 0 else 0
        return k_in, k_out, axis_count

    def get_train(self):
        self.speed_all = np.zeros(len(self.axis_all))
        self.speed_all[np.isin(self.axis_all, self.axis_out)] = self.speed
        data = (((self.axis_all - self.axis_all[1]) / 100).tolist(),
                self.weights_near.tolist(),
                self.weights_far.tolist(),
                (np.isin(self.axis_all, self.axis_out) + 1).tolist(),
                self.speed_all.tolist())
        train = list(map(list,zip(data[0], data[1], data[2], data[3], data[4])))
        return train[1:-1]

def main():
    x = np.array(range(80))
    y = np.sin(x / 40 * 2 * 3.14159)
    y = np.array([v if abs(v)<0.5 else 0 for v in y])
    tresh = 0.5
    f, b = signal2edge(y > tresh)
    f2, b2 = signal2edge(y < -tresh)
    cf = (y[f] < tresh) & (y[f + 1] > tresh)
    cb = (y[b] > tresh) & (y[b + 1] < tresh)
    print("Test edge: ", np.all(cf) and np.all(cb))

    axis = edge2axis((f, b))
    print("Test axis: ", np.all(y[axis]==1))

    x = np.array(range(80))
    n = 100
    y = np.concatenate([[v]*n for v in [0,0,500,1000,1000,1000,500,0,0]])
    y[425:475] = 500
    ax = AxisDetector()
    for i in range(y.shape[0]):
        row = [y[i] / 4, y[i] / 4, y[i] / 4, y[i] / 4]
        ax.tick(row[0], row[1], row[2], row[3])
    ax.analysis()
    ax.calc_weights()
    print("Test train:", len(ax.axis_in)==len(ax.axis_out) and len(ax.axis_in)==3)
    print("Test train weight:", sum(abs(ax.weights_in-500))+sum(abs(ax.weights_out+500))<1)
    print("Test train time:", len(ax.axis_in)==len(ax.axis_out) and len(ax.axis_in)==3)

    if 1:
        print(ax.axis_in)
        print(ax.axis_out)
        print(ax.weights_all)
        print(ax.weights_diff)
        print(ax.weights_in)
        print(ax.weights_out)
        print(ax.get_train())

if __name__ == '__main__':
    main()