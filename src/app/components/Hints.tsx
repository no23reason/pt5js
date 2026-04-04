import type { FC, ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import "./Hints.css";

const values = {
    c: (node: ReactNode) => <code>{node}</code>,
};

export const Hints: FC = () => {
    return (
        <details>
            <summary>
                <FormattedMessage id="hints.title" />
            </summary>
            <h3>
                <code>G01 X Y</code>: <FormattedMessage id="hints.g01" values={values} />
            </h3>
            <FormattedMessage tagName="h4" id="hints.ex" values={values} />
            <p>
                <code>G01 X+100</code>&nbsp;
                <FormattedMessage id="hints.g01.ex1" values={values} />
            </p>
            <p>
                <code>G01 Y-100</code>&nbsp;
                <FormattedMessage id="hints.g01.ex2" values={values} />
            </p>
            <p>
                <code>G01 X-100 Y+100</code>&nbsp;
                <FormattedMessage id="hints.g01.ex3" values={values} />
            </p>
            <h3>
                <code>G02 X Y I J</code> / <code>G03 X Y I J</code>:{" "}
                <FormattedMessage id="hints.g0203" values={values} />
            </h3>
            <FormattedMessage tagName="h4" id="hints.ex" values={values} />
            <table className="table">
                <thead>
                    <tr>
                        <th>&nbsp;</th>
                        <th>◜</th>
                        <th>◝</th>
                        <th>◞</th>
                        <th>◟</th>
                        <th>◠</th>
                        <th>◡</th>
                        <th>(</th>
                        <th>)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>G02</th>
                        <td>
                            <code>Y+ I-</code>
                        </td>
                        <td>
                            <code>X+ J+</code>
                        </td>
                        <td>
                            <code>Y- I+</code>
                        </td>
                        <td>
                            <code>X- J-</code>
                        </td>
                        <td>
                            <code>X+ I-</code>
                        </td>
                        <td>
                            <code>X- I+</code>
                        </td>
                        <td>
                            <code>Y+ J-</code>
                        </td>
                        <td>
                            <code>Y- J+</code>
                        </td>
                    </tr>
                    <tr>
                        <th>G03</th>
                        <td>
                            <code>X- J+</code>
                        </td>
                        <td>
                            <code>Y+ I+</code>
                        </td>
                        <td>
                            <code>X+ J-</code>
                        </td>
                        <td>
                            <code>Y- I-</code>
                        </td>
                        <td>
                            <code>X- I+</code>
                        </td>
                        <td>
                            <code>X+ I-</code>
                        </td>
                        <td>
                            <code>Y- J+</code>
                        </td>
                        <td>
                            <code>Y+ J-</code>
                        </td>
                    </tr>
                </tbody>
            </table>
        </details>
    );
};
